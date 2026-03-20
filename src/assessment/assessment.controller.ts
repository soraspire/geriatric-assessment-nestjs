import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { AuthenticatedGuard } from '../auth/local-auth.guard';

@Controller('assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) { }

  @Post()
  async store(@Body() dto: CreateAssessmentDto) {
    const assessment = await this.assessmentService.create(dto);
    return assessment;
  }

  @Get('management')
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
    };
  }

  @Get(':uuid')
  async show(@Param('uuid') uuid: string) {
    const assessment = await this.assessmentService.findByUuid(uuid);
    if (!assessment) {
      throw new NotFoundException('Không tìm thấy phiếu đánh giá.');
    }
    const results = this.assessmentService.getInterpretations(assessment);
    return { assessment, results };
  }
}
