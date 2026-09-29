import { VocabularyEntry } from "../types/vocabulary";

export const INITIAL_CURATED_VOCABULARY: VocabularyEntry[] = [
  {
    id: "vocab-seolleda",
    koreanWord: "설레다",
    romanization: "seolleda",
    vietnamesePronunciation: "xol-lê-đa",
    partOfSpeech: "동사 · Động từ (Nội động từ)",
    topikLevel: "TOPIK II · Trung cấp 3",
    hanjaOrigin: "순우리말 · Từ thuần Hàn",
    vietnameseMeaning: "Bồi hồi, xao xuyến, rung động, háo hức mong chờ",
    koreanDefinition: "마음이 가라앉지 아니하고 들떠서 자꾸 두근거리다.",
    vietnameseExplanation:
      "Dùng để diễn tả cảm giác tim đập rộn ràng, háo hức tích cực trước một sự kiện mới mẻ (chuyến đi xa, ngày đầu đi làm) hoặc cảm giác rung động khi mới yêu. Lưu ý: Đây là động từ (동사) nên khi bổ nghĩa cho danh từ ở hiện tại phải chia là '설레는' (không dùng '설레이는').",
    synonyms: ["두근거리다 (tim đập thình thịch)", "들뜨다 (nôn nao, rộn ràng)"],
    antonyms: ["차분하다 (điềm tĩnh, lắng dịu)", "담담하다 (bình thản)"],
    collocations: [
      { korean: "마음이 설레다", vietnamese: "lòng bồi hồi xao xuyến" },
      { korean: "설레는 마음으로", vietnamese: "với tâm trạng đầy háo hức" },
      { korean: "가슴이 설레다", vietnamese: "con tim rung động" },
    ],
    contextStyle: "daily",
    createdAt: "2026-09-27T09:00:00.000Z",
    masteryLevel: "learning",
    examples: [
      {
        id: 1,
        register: "해요체 · Giao tiếp lịch sự thân mật",
        contextSituation: "첫 한국 여행을 앞둔 밤 · Đêm trước chuyến du lịch Hàn Quốc đầu tiên",
        koreanSentence: "내일 처음으로 서울에 가는데 마음이 너무 설레서 잠이 안 와요.",
        highlightedForm: "설레서",
        romanization: "Naeil cheoeumeuro Seoure ganeunde maeumi neomu seolleseo jami an wayo.",
        koreanMeaning:
          "내일 서울에 처음 가는 날이라서 기분이 들뜨고 기대되어 쉽게 잠들 수 없다는 뜻입니다.",
        vietnameseMeaning:
          "Ngày mai là lần đầu tiên tôi đi Seoul nên trong lòng bồi hồi, háo hức quá không tài nào ngủ được.",
        grammarAndNuanceNote:
          "Cấu trúc '-는데' dùng để mở đầu bối cảnh; '설레다 + -아서/어서' chuyển thành '설레서' chỉ nguyên nhân dẫn đến việc không ngủ được (잠이 안 오다).",
        wordBreakdown: [
          { korean: "내일 처음으로", vietnamese: "ngày mai là lần đầu tiên", role: "Trạng ngữ" },
          { korean: "서울에 가는데", vietnamese: "đi đến Seoul nên", role: "Mệnh đề bối cảnh" },
          { korean: "마음이 너무 설레서", vietnamese: "vì lòng quá bồi hồi háo hức", role: "Mệnh đề nguyên nhân" },
          { korean: "잠이 안 와요", vietnamese: "không ngủ được", role: "Vị ngữ chính" },
        ],
      },
      {
        id: 2,
        register: "합쇼체 · Văn phong trang trọng / Chia sẻ cảm xúc",
        contextSituation: "새 학기 입학식 소감 · Phát biểu cảm nghĩ ngày khai giảng học kỳ mới",
        koreanSentence: "새로운 시작을 앞두고 누구나 설레는 마음과 동시에 작은 두려움을 느낍니다.",
        highlightedForm: "설레는",
        romanization:
          "Saeroun sijageul apdugo nuguna seolleneun maeumgwa dongsie jageun duryeoumeul neukkimnida.",
        koreanMeaning:
          "새로운 일을 시작하기 전에는 모든 사람이 기대감으로 가슴이 두근거리면서도 한편으로는 조금 걱정스러운 감정을 느낀다는 의미입니다.",
        vietnameseMeaning:
          "Đứng trước một khởi đầu mới, bất kỳ ai cũng đều cảm thấy một nỗi sợ nhỏ bé song hành cùng tâm trạng bồi hồi, háo hức.",
        grammarAndNuanceNote:
          "Định ngữ hiện tại của động từ '설레다' là '설레는' bổ nghĩa cho danh từ '마음' (tâm trạng/tấm lòng). Cụm '...과/와 동시에' nghĩa là 'đồng thời với...'.",
        wordBreakdown: [
          { korean: "새로운 시작을 앞두고", vietnamese: "đứng trước khởi đầu mới", role: "Cụm trạng ngữ" },
          { korean: "누구나", vietnamese: "bất cứ ai cũng", role: "Chủ ngữ" },
          { korean: "설레는 마음과 동시에", vietnamese: "đồng thời với tâm trạng bồi hồi", role: "Cụm trạng ngữ" },
          { korean: "작은 두려움을 느낍니다", vietnamese: "cảm thấy một nỗi lo sợ nhỏ", role: "Cụm động từ" },
        ],
      },
    ],
  },
  {
    id: "vocab-nunchi",
    koreanWord: "눈치",
    romanization: "nunchi",
    vietnamesePronunciation: "nun-chi",
    partOfSpeech: "명사 · Danh từ",
    topikLevel: "TOPIK II · Trung cấp 3",
    hanjaOrigin: "순우리말 · Từ thuần Hàn",
    vietnameseMeaning: "Sự tinh ý, khả năng nắm bắt ý tứ và bầu không khí xung quanh",
    koreanDefinition: "남의 마음이나 일의 낌새를 그때그때 상황으로 미루어 알아채는 힘.",
    vietnameseExplanation:
      "Khái niệm văn hóa đặc trưng của người Hàn: nghệ thuật quan sát nét mặt, thái độ của người đối diện và không khí chung để ứng xử khéo léo mà không cần đối phương phải nói thẳng.",
    synonyms: ["감각 (cảm quan, sự nhạy bén)", "요령 (sự khéo léo)"],
    antonyms: ["무신경 (sự vô tâm, thiếu tinh tế)"],
    collocations: [
      { korean: "눈치가 빠르다", vietnamese: "nhanh nhạy, biết nhìn sắc mặt" },
      { korean: "눈치를 보다", vietnamese: "dò xét thái độ, nhìn nét mặt" },
      { korean: "눈치가 없다", vietnamese: "kém tinh tế, không biết ý tứ" },
    ],
    contextStyle: "culture",
    createdAt: "2026-09-27T08:30:00.000Z",
    masteryLevel: "reviewing",
    examples: [
      {
        id: 1,
        register: "해요체 · Giao tiếp công sở hàng ngày",
        contextSituation: "직장 동료에 대한 칭찬 · Khen ngợi đồng nghiệp tại văn phòng",
        koreanSentence: "민수 씨는 눈치가 빨라서 제가 말하지 않아도 필요한 자료를 미리 준비해 줘요.",
        highlightedForm: "눈치가 빨라서",
        romanization:
          "Minsu ssineun nunchiga ppallaseo jega malhaji anado piryohan jaryoreul miri junbihae jwoyo.",
        koreanMeaning:
          "민수 씨는 상황을 파악하는 능력이 뛰어나서 직접 부탁하지 않아도 알아서 필요한 것을 먼저 챙겨 준다는 뜻입니다.",
        vietnameseMeaning:
          "Anh Minsu rất tinh ý nên dù tôi không nói ra, anh ấy cũng chuẩn bị sẵn tài liệu cần thiết giúp tôi từ trước.",
        grammarAndNuanceNote:
          "Cụm quán용어 (quán dụng ngữ) '눈치가 빠르다' (nhanh nhạy, tinh ý) kết hợp với '-아/어서' (vì... nên) và '-아/어 주다' (làm gì đó giúp ai).",
        wordBreakdown: [
          { korean: "민수 씨는", vietnamese: "Anh Minsu thì", role: "Chủ ngữ" },
          { korean: "눈치가 빨라서", vietnamese: "vì rất tinh ý nên", role: "Mệnh đề nguyên nhân" },
          { korean: "제가 말하지 않아도", vietnamese: "dù tôi không nói ra", role: "Mệnh đề nhượng bộ" },
          { korean: "필요한 자료를 미리 준비해 줘요", vietnamese: "chuẩn bị sẵn tài liệu cần thiết giúp", role: "Vị ngữ" },
        ],
      },
      {
        id: 2,
        register: "합쇼체 · Văn phong trang trọng / Thảo luận xã hội",
        contextSituation: "조직 문화에 대한 조언 · Lời khuyên về văn hóa làm việc nhóm",
        koreanSentence: "너무 남의 눈치만 보지 말고 자신의 의견을 당당하게 표현하는 태도가 필요합니다.",
        highlightedForm: "눈치만 보지",
        romanization:
          "Neomu namui nunchiman boji malgo jasinui uigyeoneul dangdanghage pyohyeonhaneun taedoga piryohamnida.",
        koreanMeaning:
          "다른 사람들의 기분이나 반응만 지나치게 살피지 말고, 자기 생각을 자신 있게 말하는 자세가 중요하다는 뜻입니다.",
        vietnameseMeaning:
          "Đừng chỉ mãi dò xét thái độ của người khác mà cần có thái độ tự tin bày tỏ chính kiến của bản thân.",
        grammarAndNuanceNote:
          "Cụm '남의 눈치를 보다' (nhìn sắc mặt/dò xét thái độ người khác) đi với tiểu từ giới hạn '-만' (chỉ) và cấu trúc khuyên nhủ '-지 말고' (đừng... mà hãy...).",
        wordBreakdown: [
          { korean: "너무 남의 눈치만 보지 말고", vietnamese: "đừng chỉ mãi nhìn sắc mặt người khác", role: "Cụm phủ định khuyên nhủ" },
          { korean: "자신의 의견을", vietnamese: "ý kiến của bản thân", role: "Tân ngữ" },
          { korean: "당당하게 표현하는 태도가", vietnamese: "thái độ bày tỏ một cách tự tin", role: "Chủ ngữ" },
          { korean: "필요합니다", vietnamese: "là cần thiết", role: "Vị ngữ" },
        ],
      },
    ],
  },
  {
    id: "vocab-kkujunhi",
    koreanWord: "꾸준히",
    romanization: "kkujunhi",
    vietnamesePronunciation: "cu-chun-hi",
    partOfSpeech: "부사 · Phó từ (Trạng từ)",
    topikLevel: "TOPIK II · Trung cấp 3",
    hanjaOrigin: "순우리말 · Từ thuần Hàn (Gốc tính từ: 꾸준하다)",
    vietnameseMeaning: "Đều đặn, kiên trì, bền bỉ không ngừng nghỉ",
    koreanDefinition: "한결같이 부지런하고 끈기 있게 계속하여.",
    vietnameseExplanation:
      "Phó từ cực kỳ phổ biến trong các bài thi TOPIK và hội thoại đời sống khi nói về thói quen tốt: học ngoại ngữ, tập thể dục, tiết kiệm hoặc rèn luyện bản thân mỗi ngày.",
    synonyms: ["계속해서 (tiếp tục, liên tục)", "성실히 (một cách chăm chỉ, cần mẫn)"],
    antonyms: ["가끔 (thỉnh thoảng)", "중도 포기하다 (bỏ cuộc giữa chừng)"],
    collocations: [
      { korean: "꾸준히 노력하다", vietnamese: "nỗ lực bền bỉ" },
      { korean: "꾸준히 연습하다", vietnamese: "luyện tập đều đặn" },
      { korean: "꾸준히 운동하다", vietnamese: "tập thể dục đều đặn" },
    ],
    contextStyle: "topik",
    createdAt: "2026-09-27T08:00:00.000Z",
    masteryLevel: "mastered",
    examples: [
      {
        id: 1,
        register: "해요체 · Chia sẻ kinh nghiệm học tập",
        contextSituation: "한국어 공부 비법 조언 · Chia sẻ bí quyết học tiếng Hàn",
        koreanSentence: "매일 하루에 한국어 단어를 열 개씩 꾸준히 외우면 실력이 금방 늘 거예요.",
        highlightedForm: "꾸준히",
        romanization:
          "Maeil harue hangugeo daneoreul yeol gaessik kkujunhi oeumyeon sillyeogi geumbang neul geoyeyo.",
        koreanMeaning:
          "중간에 쉬지 않고 날마다 일정한 양의 단어를 성실하게 암기하면 한국어 능력이 빠르게 향상될 것이라는 뜻입니다.",
        vietnameseMeaning:
          "Nếu mỗi ngày bạn đều đặn học thuộc mười từ vựng tiếng Hàn thì trình độ sẽ nhanh chóng tiến bộ thôi.",
        grammarAndNuanceNote:
          "Hậu tố '-씩' (mỗi phần/mỗi ngày 10 từ) kết hợp với phó từ '꾸준히' (đều đặn) và cấu trúc giả định '-(으)면 ... -(으)ㄹ 거예요'.",
        wordBreakdown: [
          { korean: "매일 하루에", vietnamese: "mỗi ngày", role: "Trạng ngữ thời gian" },
          { korean: "한국어 단어를 열 개씩", vietnamese: "mỗi lần 10 từ vựng tiếng Hàn", role: "Tân ngữ" },
          { korean: "꾸준히 외우면", vietnamese: "nếu học thuộc lòng đều đặn", role: "Mệnh đề điều kiện" },
          { korean: "실력이 금방 늘 거예요", vietnamese: "năng lực sẽ nhanh chóng tăng lên", role: "Mệnh đề kết quả" },
        ],
      },
      {
        id: 2,
        register: "합쇼체 · Văn nghị luận TOPIK II",
        contextSituation: "건강 관리와 습관에 대한 발표 · Bài thuyết trình về quản lý sức khỏe và thói quen",
        koreanSentence: "작은 목표라도 포기하지 않고 꾸준히 실천하는 사람이 결국 큰 성공을 거둡니다.",
        highlightedForm: "꾸준히 실천하는",
        romanization:
          "Jageun mokpyorado pogihaji anko kkujunhi silcheonhaneun sarami gyeolguk keun seonggongeul geodumnida.",
        koreanMeaning:
          "사소한 계획이라도 끝까지 끈기 있게 행동으로 옮기는 사람이 마지막에 좋은 결과를 얻는다는 의미입니다.",
        vietnameseMeaning:
          "Dù là mục tiêu nhỏ nhưng người không bỏ cuộc và kiên trì thực hiện đều đặn rốt cuộc sẽ gặt hái được thành công lớn.",
        grammarAndNuanceNote:
          "Cấu trúc '-라도' (cho dù là...) + '포기하지 않고' (không từ bỏ mà) + '꾸준히 실천하다' (kiên trì thực hành). Cụm '성공을 거두다' là cụm cố định nghĩa là 'gặt hái thành công'.",
        wordBreakdown: [
          { korean: "작은 목표라도", vietnamese: "dù là mục tiêu nhỏ", role: "Cụm nhượng bộ" },
          { korean: "포기하지 않고", vietnamese: "không từ bỏ mà", role: "Cụm liên kết" },
          { korean: "꾸준히 실천하는 사람이", vietnamese: "người kiên trì thực hiện đều đặn", role: "Chủ ngữ" },
          { korean: "결국 큰 성공을 거둡니다", vietnamese: "cuối cùng gặt hái thành công lớn", role: "Vị ngữ" },
        ],
      },
    ],
  },
  {
    id: "vocab-baeryeo",
    koreanWord: "배려",
    romanization: "baeryeo",
    vietnamesePronunciation: "be-ryo",
    partOfSpeech: "명사 · Danh từ (배려하다: Động từ)",
    topikLevel: "TOPIK II · Trung cấp 4",
    hanjaOrigin: "配慮 · Âm Hán Việt: Phối Lự",
    vietnameseMeaning: "Sự quan tâm, chu đáo, nghĩ cho người khác",
    koreanDefinition: "도와주거나 보살펴 주려고 마음을 씀.",
    vietnameseExplanation:
      "Từ Hán-Hàn (配慮 - Phối lự) mang ý nghĩa đặt mình vào vị trí của người khác để giúp đỡ hoặc tạo sự thoải mái cho họ (ví dụ: nhường ghế trên tàu điện ngầm, nói nhỏ nơi công cộng).",
    synonyms: ["관심 (sự quan tâm)", "보살핌 (sự chăm sóc)"],
    antonyms: ["무시 (sự phớt lờ)", "이기심 (lòng ích kỷ)"],
    collocations: [
      { korean: "상대방을 배려하다", vietnamese: "quan tâm, nghĩ cho đối phương" },
      { korean: "깊은 배려", vietnamese: "sự quan tâm sâu sắc" },
      { korean: "배려심", vietnamese: "lòng chu đáo, biết nghĩ cho người khác" },
    ],
    contextStyle: "business",
    createdAt: "2026-09-27T07:30:00.000Z",
    masteryLevel: "learning",
    examples: [
      {
        id: 1,
        register: "해요체 · Giao tiếp lịch sự nơi công cộng",
        contextSituation: "대중교통 예절 안내 · Hướng dẫn văn hóa ứng xử trên phương tiện công cộng",
        koreanSentence: "지하철에서는 다른 승객들을 위해 작은 배려를 실천해 주세요.",
        highlightedForm: "배려를",
        romanization: "Jihacheoreseoneun dareun seunggaekdeureul wihae jageun baeryeoreul silcheonhae juseyo.",
        koreanMeaning:
          "지하철을 이용할 때 주변 사람들이 불편하지 않도록 서로 마음을 써서 예의를 지켜 달라는 뜻입니다.",
        vietnameseMeaning:
          "Trên tàu điện ngầm, xin hãy thực hiện những sự quan tâm nhỏ nhặt vì các hành khách khác.",
        grammarAndNuanceNote:
          "Cấu trúc 'N + -을/를 위해' (vì/cho ai đó) kết hợp với '배려를 실천하다' (thực hành sự quan tâm/tinh thần nghĩ cho người khác).",
        wordBreakdown: [
          { korean: "지하철에서는", vietnamese: "ở trên tàu điện ngầm thì", role: "Trạng ngữ nơi chốn" },
          { korean: "다른 승객들을 위해", vietnamese: "vì những hành khách khác", role: "Cụm mục đích" },
          { korean: "작은 배려를", vietnamese: "sự quan tâm nhỏ", role: "Tân ngữ" },
          { korean: "실천해 주세요", vietnamese: "xin hãy thực hiện", role: "Vị ngữ thỉnh cầu" },
        ],
      },
      {
        id: 2,
        register: "합쇼체 · Thư cảm ơn công việc / Trang trọng",
        contextSituation: "업무 협조에 대한 감사 인사 · Lời cảm ơn đối tác và đồng nghiệp hỗ trợ công việc",
        koreanSentence: "팀장님의 따뜻한 배려 덕분에 이번 프로젝트를 성공적으로 마칠 수 있었습니다.",
        highlightedForm: "배려 덕분에",
        romanization:
          "Timjangnimui ttatteuthan baeryeo deokbune ibeon peurojekteureul seonggongjeogeuro machil su isseotseumnida.",
        koreanMeaning:
          "팀장님께서 세심하게 도와주시고 신경 써 주신 결과로 이번 일을 잘 끝낼 수 있었다는 감사의 표현입니다.",
        vietnameseMeaning:
          "Nhờ có sự quan tâm ấm áp của Trưởng nhóm mà chúng tôi đã có thể hoàn thành dự án lần này một cách thành công.",
        grammarAndNuanceNote:
          "Danh từ '배려' đi với '덕분에' (nhờ có... - mang sắc thái tích cực, biết ơn) và đuôi quá khứ trang trọng '-았/었습니다'.",
        wordBreakdown: [
          { korean: "팀장님의 따뜻한 배려 덕분에", vietnamese: "nhờ sự quan tâm ấm áp của Trưởng nhóm", role: "Cụm nguyên nhân tích cực" },
          { korean: "이번 프로젝트를", vietnamese: "dự án lần này", role: "Tân ngữ" },
          { korean: "성공적으로", vietnamese: "một cách thành công", role: "Trạng ngữ" },
          { korean: "마칠 수 있었습니다", vietnamese: "đã có thể hoàn thành", role: "Vị ngữ" },
        ],
      },
    ],
  },
];

export interface TopikCategoryGroup {
  id: string;
  title: string;
  level: string;
  description: string;
  words: {
    korean: string;
    hanja: string;
    vietnamese: string;
    pos: string;
  }[];
}

export const TOPIK_EXPLORER_GROUPS: TopikCategoryGroup[] = [
  {
    id: "topik-emotion",
    title: "01. Cảm xúc & Tâm trạng tinh tế (감정과 심리)",
    level: "TOPIK I–II",
    description: "Những từ vựng diễn tả chiều sâu tâm lý đặc trưng trong giao tiếp và văn học Hàn Quốc.",
    words: [
      { korean: "설레다", hanja: "순우리말", vietnamese: "Bồi hồi, xao xuyến, háo hức", pos: "동사" },
      { korean: "그립다", hanja: "순우리말", vietnamese: "Nhớ nhung, hoài niệm", pos: "형용사" },
      { korean: "서운하다", hanja: "순우리말", vietnamese: "Tủi thân, chạnh lòng, tiếc nuối", pos: "형용사" },
      { korean: "뿌듯하다", hanja: "순우리말", vietnamese: "Tự hào, mãn nguyện trong lòng", pos: "형용사" },
      { korean: "아쉽다", hanja: "순우리말", vietnamese: "Tiếc nuối, chưa trọn vẹn", pos: "형용사" },
      { korean: "어색하다", hanja: "순우리말", vietnamese: "Ngượng ngùng, gượng gạo", pos: "형용사" },
    ],
  },
  {
    id: "topik-hanja",
    title: "02. Từ vựng Hán-Hàn trọng tâm TOPIK II (고급 한자어)",
    level: "TOPIK II · Cấp 3–6",
    description: "Đối chiếu trực tiếp chữ Hán và Âm Hán Việt giúp người Việt nhớ từ vựng Hàn Quốc nhanh gấp 3 lần.",
    words: [
      { korean: "배려", hanja: "配慮 · Phối lự", vietnamese: "Sự quan tâm, chu đáo", pos: "명사" },
      { korean: "기대", hanja: "期待 · Kỳ đãi", vietnamese: "Sự kỳ vọng, mong đợi", pos: "명사" },
      { korean: "영향", hanja: "影響 · Ảnh hưởng", vietnamese: "Sự ảnh hưởng, tác động", pos: "명사" },
      { korean: "해결하다", hanja: "解決 · Giải quyết", vietnamese: "Giải quyết (vấn đề)", pos: "동사" },
      { korean: "극복하다", hanja: "克服 · Khắc phục", vietnamese: "Khắc phục, vượt qua khó khăn", pos: "동사" },
      { korean: "책임감", hanja: "責任感 · Trách nhiệm cảm", vietnamese: "Tinh thần trách nhiệm", pos: "명사" },
    ],
  },
  {
    id: "topik-culture",
    title: "03. Văn hóa & Đời sống Hàn Quốc đương đại (한국 문화와 일상)",
    level: "Thực tế & Giao tiếp",
    description: "Từ vựng gắn liền với nếp sống, văn hóa công sở và xu hướng đời sống tại Hàn Quốc.",
    words: [
      { korean: "눈치", hanja: "순우리말", vietnamese: "Sự tinh ý, biết nhìn sắc mặt", pos: "명사" },
      { korean: "소확행", hanja: "小確幸 · Tiểu xác hạnh", vietnamese: "Niềm hạnh phúc nhỏ nhưng chắc chắn", pos: "명사" },
      { korean: "인연", hanja: "因緣 · Nhân duyên", vietnamese: "Nhân duyên, mối duyên gặp gỡ", pos: "명사" },
      { korean: "정", hanja: "情 · Tình", vietnamese: "Tình cảm gắn bó, cái tình", pos: "명사" },
      { korean: "워라밸", hanja: "외래어 약어", vietnamese: "Sự cân bằng công việc và cuộc sống", pos: "명사" },
      { korean: "꾸준히", hanja: "순우리말", vietnamese: "Đều đặn, bền bỉ, kiên trì", pos: "부사" },
    ],
  },
];
