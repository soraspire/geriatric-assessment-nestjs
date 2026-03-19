import { IsNotEmpty, IsNumber, IsString, IsOptional, IsArray, IsIn, Min, Max, ValidateNested, ArrayNotEmpty, ArrayMinSize, ArrayMaxSize, IsDefined } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ToNumber } from 'src/common/decorators/to-number.decorator';

class MainDto {
  @IsNotEmpty({ message: 'Vui lòng nhập họ tên bệnh nhân.' })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự.' })
  patient_name: string;

  @ToNumber()
  @IsDefined({ message: 'Vui lòng nhập năm sinh.' })
  @IsNumber({ allowNaN: false }, { message: 'Năm sinh phải là số.' })
  birth_year: number;

  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @IsNotEmpty({ message: 'Vui lòng chọn giới tính.' })
  @IsIn(['1', '2'], { message: 'Giới tính không hợp lệ.' })
  gender: string;

  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại người nhà.' })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự.' })
  phone_number: string;

  @IsNotEmpty({ message: 'Vui lòng nhập công việc trước đây.' })
  @IsString({ message: 'Công việc phải là chuỗi ký tự.' })
  previous_job: string;

  @ToNumber()
  @IsDefined({ message: 'Vui lòng nhập chiều cao.' })
  @IsNumber({ allowNaN: false }, { message: 'Chiều cao phải là số.' })
  height: number;

  @ToNumber()
  @IsDefined({ message: 'Vui lòng nhập cân nặng.' })
  @IsNumber({ allowNaN: false }, { message: 'Cân nặng phải là số.' })
  weight: number;

  @ToNumber()
  @IsDefined({ message: 'Vui lòng nhập BMI.' })
  @IsNumber({ allowNaN: false }, { message: 'BMI phải là số.' })
  bmi: number;
}

class MinicogDto {
  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @ToNumber()
  @IsDefined({ message: 'Vui lòng chọn hình ảnh đồng hồ.' })
  @IsNumber({ allowNaN: false }, { message: 'Vui lòng chọn hình ảnh đồng hồ.' })
  clock_selected: number;

  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '') : value))
  @IsArray({ message: 'Vui lòng chọn các từ nhớ lại.' })
  @ArrayMinSize(3, { message: 'Vui lòng chọn đúng 3 từ nhớ lại.' })
  @ArrayMaxSize(3, { message: 'Vui lòng chọn đúng 3 từ nhớ lại.' })
  recall: string[];
}

class MnaDto {
  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @ToNumber()
  @IsDefined({ message: 'Vui lòng chọn mức độ ăn uống.' })
  @IsNumber({ allowNaN: false })
  giam_an_uong: number;

  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @ToNumber()
  @IsDefined({ message: 'Vui lòng chọn mức độ sút cân.' })
  @IsNumber({ allowNaN: false })
  sut_can: number;

  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @ToNumber()
  @IsDefined({ message: 'Vui lòng chọn khả năng vận động.' })
  @IsNumber({ allowNaN: false })
  kha_nang_van_dong: number;

  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @ToNumber()
  @IsDefined({ message: 'Vui lòng chọn stress thể chất hoặc bệnh lý.' })
  @IsNumber({ allowNaN: false })
  stress_tam_ly: number;

  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @ToNumber()
  @IsDefined({ message: 'Vui lòng chọn vấn đề tâm thần kinh.' })
  @IsNumber({ allowNaN: false })
  van_de_tam_than_kinh: number;

  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @ToNumber()
  @IsDefined({ message: 'Vui lòng chọn điểm BMI.' })
  @IsNumber({ allowNaN: false })
  bmi_score: number;
}

class CfsDto {
  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @ToNumber()
  @IsDefined({ message: 'Vui lòng chọn mức độ suy yếu lâm sàng.' })
  @IsNumber({ allowNaN: false })
  cfs_level: number;
}

class MorseDto {
  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @ToNumber()
  @IsDefined({ message: 'Vui lòng chọn tiền sử té ngã.' })
  @IsNumber({ allowNaN: false })
  tien_su_te_nga: number;

  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @ToNumber()
  @IsDefined({ message: 'Vui lòng chọn bệnh lý đi kèm.' })
  @IsNumber({ allowNaN: false })
  benh_ly_di_kem: number;

  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @ToNumber()
  @IsDefined({ message: 'Vui lòng chọn đường truyền dịch.' })
  @IsNumber({ allowNaN: false })
  duong_truyen_dich: number;

  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @ToNumber()
  @IsDefined({ message: 'Vui lòng chọn hỗ trợ đi lại.' })
  @IsNumber({ allowNaN: false })
  ho_tro_di_lai: number;

  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @ToNumber()
  @IsDefined({ message: 'Vui lòng chọn bất thường di chuyển.' })
  @IsNumber({ allowNaN: false })
  bat_thuong_di_chuyen: number;

  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @ToNumber()
  @IsDefined({ message: 'Vui lòng chọn tình trạng tinh thần.' })
  @IsNumber({ allowNaN: false })
  tinh_trang_tinh_than: number;
}

class OtherDto {
  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @IsNotEmpty({ message: 'Vui lòng chọn tiền sử dị ứng thuốc.' })
  @IsIn(['0', '1'], { message: 'Vui lòng chọn tiền sử dị ứng thuốc.' })
  has_drug_allergy: string;

  @IsOptional()
  @IsString({ message: 'Chi tiết dị ứng phải là chuỗi ký tự.' })
  drug_allergy_detail: string;

  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @IsNotEmpty({ message: 'Vui lòng chọn tình trạng giác quan.' })
  @IsIn(['0', '1'], { message: 'Vui lòng chọn tình trạng giác quan.' })
  has_sensory_impairment: string;

  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @IsNotEmpty({ message: 'Vui lòng chọn tình trạng tiểu không tự chủ.' })
  @IsIn(['0', '1'], { message: 'Vui lòng chọn tình trạng tiểu không tự chủ.' })
  has_incontinence: string;

  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @IsNotEmpty({ message: 'Vui lòng chọn nguy cơ loét.' })
  @IsIn(['0', '1'], { message: 'Vui lòng chọn nguy cơ loét.' })
  has_pressure_ulcer_risk: string;

  @Transform(({ value }) => (Array.isArray(value) ? value.filter((v) => v !== '').pop() || '' : value))
  @IsNotEmpty({ message: 'Vui lòng chọn tình trạng người chăm sóc.' })
  @IsIn(['0', '1'], { message: 'Vui lòng chọn tình trạng người chăm sóc.' })
  has_caregiver: string;
}

export class CreateAssessmentDto {
  @IsDefined({ message: 'Thiếu thông tin bệnh nhân.' })
  @ValidateNested()
  @Type(() => MainDto)
  main: MainDto;

  @IsOptional()
  cci?: Record<string, any>;

  @IsDefined({ message: 'Vui lòng hoàn thành phần Mini-Cog.' })
  @ValidateNested()
  @Type(() => MinicogDto)
  minicog: MinicogDto;

  @IsDefined({ message: 'Vui lòng hoàn thành phần dinh dưỡng MNA.' })
  @ValidateNested()
  @Type(() => MnaDto)
  mna: MnaDto;

  @IsDefined({ message: 'Vui lòng hoàn thành phần suy yếu CFS.' })
  @ValidateNested()
  @Type(() => CfsDto)
  cfs: CfsDto;

  @IsDefined({ message: 'Vui lòng hoàn thành phần nguy cơ ngã Morse.' })
  @ValidateNested()
  @Type(() => MorseDto)
  morse: MorseDto;

  @IsDefined({ message: 'Vui lòng hoàn thành phần thông tin khác.' })
  @ValidateNested()
  @Type(() => OtherDto)
  other: OtherDto;
}
