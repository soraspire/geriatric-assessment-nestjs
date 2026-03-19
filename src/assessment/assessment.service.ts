import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';

@Injectable()
export class AssessmentService {
  constructor(private prisma: PrismaService) { }

  async findAll(filters: any, page: number = 1, limit: number = 10) {
    const where: any = {};
    if (filters.name) {
      where.patientName = { contains: filters.name, mode: 'insensitive' };
    }
    if (filters.gender) {
      where.gender = Number(filters.gender);
    }
    if (filters.age) {
      const currentYear = new Date().getFullYear();
      const maxBirthYear = currentYear - Number(filters.age);
      where.birthYear = { lte: maxBirthYear };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.assessment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.assessment.count({ where }),
    ]);

    return { data, total };
  }

  async findByUuid(uuid: string) {
    return this.prisma.assessment.findUnique({
      where: { uuid },
      include: {
        cciDetails: true,
        minicogDetails: true,
        mnaDetails: true,
        cfsDetails: true,
        morseDetails: true,
        gdsDetails: true,
        otherDetails: true,
      },
    });
  }

  async create(dto: CreateAssessmentDto) {
    // 1. Map and cast patient info
    const mainData = {
      patientName: dto.main.patient_name,
      birthYear: Number(dto.main.birth_year),
      gender: Number(dto.main.gender || 0),
      phoneNumber: dto.main.phone_number || null,
      previousJob: dto.main.previous_job || null,
      height: Number(dto.main.height || 0),
      weight: Number(dto.main.weight || 0),
      bmi: Number(dto.main.bmi || 0),
    };

    // 2. Map and cast CCI details
    const cciFields = [
      'nhoi_mau_co_tim', 'suy_tim', 'benh_mach_mau_ngoai_vi', 'benh_mach_nao',
      'hen_phe_quan_copd', 'dai_thao_duong_chua_bien_chung', 'tram_cam',
      'dung_thuoc_chong_dong_mau', 'alzheimer_suy_giam_tri_nho', 'benh_mo_lien_ket',
      'tang_huyet_ap', 'liet_nua_nguoi', 'dai_thao_duong_co_bien_chung',
      'benh_than_trung_binh_nang', 'ung_thu_tai_cho', 'benh_gan_man_tinh_vua_nang',
      'ung_thu_di_can', 'hiv_aids'
    ];
    const cciDetailsData: Record<string, boolean> = {};
    cciFields.forEach(field => {
      cciDetailsData[field] = !!dto.cci?.[field];
    });

    // 3. Map and cast MNA details
    const mnaFields = ['giam_an_uong', 'sut_can', 'kha_nang_van_dong', 'stress_tam_ly', 'van_de_tam_than_kinh', 'bmi_score'];
    const mnaDetailsData: Record<string, number> = {};
    mnaFields.forEach(field => {
      mnaDetailsData[field] = Number(dto.mna?.[field] || 0);
    });

    // 4. Map and cast Morse details
    const morseFields = ['tien_su_te_nga', 'benh_ly_di_kem', 'duong_truyen_dich', 'ho_tro_di_lai', 'bat_thuong_di_chuyen', 'tinh_trang_tinh_than'];
    const morseDetailsData: Record<string, number> = {};
    morseFields.forEach(field => {
      morseDetailsData[field] = Number(dto.morse?.[field] || 0);
    });

    // 5. Map and cast Other details
    const otherDetailsData = {
      has_drug_allergy: dto.other.has_drug_allergy === '1',
      drug_allergy_detail: dto.other.drug_allergy_detail || null,
      has_sensory_impairment: dto.other.has_sensory_impairment === '1',
      has_incontinence: dto.other.has_incontinence === '1',
      has_pressure_ulcer_risk: dto.other.has_pressure_ulcer_risk === '1',
      has_caregiver: dto.other.has_caregiver === '1',
    };

    // 6. Calculate summary scores
    const cciScore = this.calculateCCIScore(cciDetailsData);
    const mnaScore = Object.values(mnaDetailsData).reduce((a: number, b: number) => a + b, 0);
    const morseScore = Object.values(morseDetailsData).reduce((a: number, b: number) => a + b, 0);
    const minicogScore = this.calculateMinicogScore(dto.minicog);

    // 7. Execute save
    return this.prisma.assessment.create({
      data: {
        ...mainData,
        cciTotalScore: cciScore,
        minicogTotalScore: minicogScore,
        mnaTotalScore: mnaScore,
        cfsTotalScore: Number(dto.cfs?.cfs_level || 1),
        morseTotalScore: morseScore,
        gdsTotalScore: 0,
        cciDetails: { create: cciDetailsData },
        minicogDetails: {
          create: {
            clockDrawingScore: dto.minicog.clock_selected === 8 ? 2 : 0,
            recallScore: this.calculateMinicogRecallScore(dto.minicog.recall || []),
          },
        },
        mnaDetails: { create: mnaDetailsData },
        cfsDetails: { create: { cfs_level: Number(dto.cfs?.cfs_level || 1) } },
        morseDetails: { create: morseDetailsData },
        otherDetails: { create: otherDetailsData },
      },
    });
  }

  private calculateCCIScore(cci: any): number {
    const weights = {
      nhoi_mau_co_tim: 1,
      suy_tim: 1,
      benh_mach_mau_ngoai_vi: 1,
      benh_mach_nao: 1,
      hen_phe_quan_copd: 1,
      dai_thao_duong_chua_bien_chung: 1,
      tram_cam: 1,
      dung_thuoc_chong_dong_mau: 1,
      alzheimer_suy_giam_tri_nho: 1,
      benh_mo_lien_ket: 1,
      tang_huyet_ap: 1,
      liet_nua_nguoi: 2,
      dai_thao_duong_co_bien_chung: 2,
      benh_than_trung_binh_nang: 2,
      ung_thu_tai_cho: 2,
      benh_gan_man_tinh_vua_nang: 3,
      ung_thu_di_can: 6,
      hiv_aids: 6,
    };

    let score = 0;
    for (const [key, weight] of Object.entries(weights)) {
      if (cci[key]) score += weight;
    }
    return score;
  }

  private calculateMinicogScore(minicog: any): number {
    let score = 0;
    if (Number(minicog.clock_selected) === 8) score += 2;
    score += this.calculateMinicogRecallScore(minicog.recall || []);
    return score;
  }

  private calculateMinicogRecallScore(recall: string[]): number {
    const correctItems = ['banana', 'dog', 'cyclebike'];
    return recall.filter(item => correctItems.includes(item)).length;
  }

  getInterpretations(assessment: any) {
    const cciScore = assessment.cciTotalScore || 0;
    let cciInterpretation = '';
    if (cciScore >= 5) {
      cciInterpretation = 'Người bệnh có bệnh lý đồng thời nghiêm trọng, điều trị cần được xem xét cẩn thận và có thể phải đối mặt với nguy cơ tử vong cao';
    } else if (cciScore >= 3) {
      cciInterpretation = 'Người bệnh có nguy cơ cao hơn về tử vong trong 10 năm tới do các bệnh lý đồng thời nghiêm trọng hơn';
    } else if (cciScore >= 1) {
      cciInterpretation = 'Người bệnh có một số bệnh lý đồng thời nhẹ và có thể kiểm soát được tình trạng bệnh';
    } else {
      cciInterpretation = 'Người bệnh không có bệnh lý đồng thời đáng kể hoặc có ít bệnh lý đồng thời và tình trạng sức khỏe tương đối tốt';
    }

    return {
      cci: {
        score: cciScore,
        max: 34,
        interpretation: cciInterpretation,
        is_risk: cciScore > 0,
        status: cciScore > 0 ? 'Đa bệnh lý' : 'Bình thường',
        activeCciList: this.getActiveCciList(assessment.cciDetails),
      },
      minicog: {
        score: assessment.minicogTotalScore || 0,
        max: 5,
        normal: '>=3',
        interpretation: (assessment.minicogTotalScore < 3) ? 'Khả năng cao có sa sút trí tuệ' : 'Khả năng thấp mắc sa sút trí tuệ (nhận thức bình thường)',
        is_risk: assessment.minicogTotalScore < 3,
        status: assessment.minicogTotalScore < 3 ? 'Có nguy cơ sa sút trí tuệ' : 'Bình thường',
      },
      mna: {
        score: assessment.mnaTotalScore || 0,
        max: 14,
        normal: '>=12',
        interpretation: (assessment.mnaTotalScore >= 12) ? 'Tình trạng dinh dưỡng bình thường' : ((assessment.mnaTotalScore >= 8) ? 'Có nguy cơ suy dinh dưỡng' : 'Suy dinh dưỡng'),
        is_risk: assessment.mnaTotalScore < 12,
        status: assessment.mnaTotalScore < 12 ? 'Có nguy cơ suy dinh dưỡng' : 'Bình thường',
      },
      cfs: {
        score: assessment.cfsTotalScore || 1,
        max: 9,
        normal: '<4',
        interpretation: (assessment.cfsTotalScore >= 7) ? 'Suy yếu nặng' : ((assessment.cfsTotalScore >= 5) ? 'Nhẹ đến vừa' : 'Không suy yếu'),
        is_risk: assessment.cfsTotalScore > 4,
        status: assessment.cfsTotalScore > 4 ? 'Có nguy cơ suy giảm chức năng' : 'Bình thường',
      },
      morse: {
        score: assessment.morseTotalScore || 0,
        max: 125,
        normal: '<24',
        interpretation: (assessment.morseTotalScore >= 45) ? 'Nguy cơ ngã cao' : ((assessment.morseTotalScore >= 25) ? 'Nguy cơ ngã trung bình' : 'Nguy cơ ngã thấp'),
        is_risk: assessment.morseTotalScore >= 25,
        status: assessment.morseTotalScore >= 25 ? 'Có nguy cơ ngã' : 'Bình thường',
      },
    };
  }

  private getActiveCciList(cci: any): string {
    if (!cci) return '';
    const labels = {
      nhoi_mau_co_tim: 'Nhồi máu cơ tim',
      suy_tim: 'Suy tim',
      benh_mach_mau_ngoai_vi: 'Bệnh mạch máu ngoại vi',
      benh_mach_nao: 'Bệnh mạch não (CVA hoặc TIA)',
      hen_phe_quan_copd: 'Hen phế quản, COPD',
      dai_thao_duong_chua_bien_chung: 'Đái tháo đường (chưa biến chung)',
      tram_cam: 'Trầm cảm',
      dung_thuoc_chong_dong_mau: 'Dùng thuốc chống đông máu',
      alzheimer_suy_giam_tri_nho: 'Alzheimer hay suy giảm trí nhớ',
      benh_mo_lien_ket: 'Bệnh mô liên kết',
      tang_huyet_ap: 'Tăng huyết áp',
      liet_nua_nguoi: 'Liệt nửa người',
      dai_thao_duong_co_bien_chung: 'Đái tháo đường có biến chứng',
      benh_than_trung_binh_nang: 'Bệnh thận mức độ trung bình/nặng',
      ung_thu_tai_cho: 'Ung thư (khối u tại chỗ chưa di căn)',
      benh_gan_man_tinh_vua_nang: 'Bệnh gan mạn tính vừa đến nặng',
      ung_thu_di_can: 'Ung thư di căn',
      hiv_aids: 'HIV hoặc AIDS',
    };

    return Object.entries(labels)
      .filter(([key]) => cci[key])
      .map(([, label]) => label)
      .join(', ');
  }
}
