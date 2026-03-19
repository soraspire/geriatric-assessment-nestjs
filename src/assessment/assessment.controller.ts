import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Render,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { AuthenticatedGuard } from '../auth/local-auth.guard';

@Controller('assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) { }

  @Get('create')
  create() {
    return {
      message: 'OK',
    };
  }

  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const errorMessages = {};
        errors.forEach((err) => {
          if (err.children && err.children.length > 0) {
            errorMessages[err.property] = errorMessages[err.property] || {};
            err.children.forEach((child) => {
              const childErrors = Object.values(child.constraints || {});
              if (childErrors.length > 0) {
                errorMessages[err.property][child.property] = childErrors[0];
              }
            });
          } else {
            const constraints = Object.values(err.constraints || {});
            if (constraints.length > 0) {
              // If it's a top-level error (like missing section), store it in _error
              if (typeof errorMessages[err.property] === 'object') {
                errorMessages[err.property]._error = constraints[0];
              } else {
                errorMessages[err.property] = { _error: constraints[0] };
              }
            }
          }
        });
        return new BadRequestException({ errorMessages, isValidationError: true });
      },
    }),
  )
  async store(@Body() dto: CreateAssessmentDto, @Res() res) {
    const assessment = await this.assessmentService.create(dto);
    return res.redirect(`/assessments/${assessment.uuid}`);
  }

  // Intercepting validation errors (since the exceptionFactory above returns an object instead of throwing)
  // We need a proper Global Filter for this to be cleaner, but I'll do it manually here for now.
  // Actually, I'll use a Filter instead.

  @Get()
  async fallbackIndex(@Res() res) {
    return res.redirect('/assessments/management');
  }

  @UseGuards(AuthenticatedGuard)
  @Get('management')
  @Render('assessments/index')
  async index(@Req() req) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { data: assessments, total } = await this.assessmentService.findAll(req.query, page, limit);
    
    const totalPages = Math.ceil(total / limit);

    return {
      assessments,
      total,
      page,
      limit,
      totalPages,
      query: req.query,
      layout: 'layouts/dashboard',
      title: 'Quản lý phiếu đánh giá'
    };
  }

  @Get(':uuid')
  @Render('assessments/show')
  async show(@Param('uuid') uuid: string) {
    const assessment = await this.assessmentService.findByUuid(uuid);
    if (!assessment) {
      return { error: 'Không tìm thấy phiếu đánh giá.' };
    }
    const results = this.assessmentService.getInterpretations(assessment);
    return { assessment, results };
  }
}
