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
  {
    id: "vocab-sohwakhaeng",
    koreanWord: "소확행",
    romanization: "sohwakhaeng",
    vietnamesePronunciation: "xô-hoắc-heng",
    partOfSpeech: "명사 · Danh từ (Từ viết tắt)",
    topikLevel: "TOPIK II · Trung cấp 4",
    hanjaOrigin: "小確幸 · Âm Hán Việt: Tiểu Xác Hạnh (소소하지만 확실한 행복)",
    vietnameseMeaning: "Niềm hạnh phúc nhỏ bé nhưng chắc chắn, đích thực",
    koreanDefinition: "일상에서 느낄 수 있는 작지만 확실하게 실현 가능한 행복.",
    vietnameseExplanation:
      "Viết tắt của cụm '소소하지만 확실한 행복'. Dùng để chỉ những niềm vui giản dị đời thường nhưng mang lại cảm giác bình yên thực sự (như uống một tách cà phê nóng buổi sáng, đọc sách ngày mưa).",
    synonyms: ["일상의 기쁨 (niềm vui đời thường)", "작은 행복 (hạnh phúc nhỏ)"],
    antonyms: ["허무감 (cảm giác trống rỗng)"],
    collocations: [
      { korean: "나만의 소확행", vietnamese: "niềm hạnh phúc nhỏ của riêng tôi" },
      { korean: "소확행을 즐기다", vietnamese: "tận hưởng niềm vui nhỏ đích thực" },
      { korean: "퇴근 후 소확행", vietnamese: "niềm vui nhỏ sau giờ tan làm" },
    ],
    contextStyle: "culture",
    createdAt: "2026-09-27T07:15:00.000Z",
    masteryLevel: "learning",
    examples: [
      {
        id: 1,
        register: "해요체 · Chia sẻ lối sống hàng ngày",
        contextSituation: "주말 휴식 이야기 · Trò chuyện về cách thư giãn cuối tuần",
        koreanSentence: "주말 아침에 따뜻한 커피를 마시며 책을 읽는 것이 저의 소확행이에요.",
        highlightedForm: "소확행이에요",
        romanization: "Jumal achime ttatteuthan keopireul masimyeo chaegeul ingneun geosi jeoui sohwakhaengieyo.",
        koreanMeaning:
          "주말 아침에 커피 한 잔과 함께 독서하는 사소한 시간이 나에게 가장 확실한 행복을 준다는 뜻입니다.",
        vietnameseMeaning:
          "Vào sáng cuối tuần, vừa nhâm nhi tách cà phê ấm áp vừa đọc sách chính là niềm hạnh phúc nhỏ đích thực của tôi.",
        grammarAndNuanceNote:
          "Cấu trúc 'V-며' (vừa làm gì vừa làm gì) kết hợp với danh từ hóa 'V-는 것' (việc...) làm chủ ngữ.",
        wordBreakdown: [
          { korean: "주말 아침에", vietnamese: "vào sáng cuối tuần", role: "Trạng ngữ" },
          { korean: "따뜻한 커피를 마시며", vietnamese: "vừa uống cà phê ấm", role: "Mệnh đề song hành" },
          { korean: "책을 읽는 것이", vietnamese: "việc đọc sách", role: "Chủ ngữ" },
          { korean: "저의 소확행이에요", vietnamese: "là niềm hạnh phúc nhỏ của tôi", role: "Vị ngữ" },
        ],
      },
      {
        id: 2,
        register: "합쇼체 · Văn phong bài viết / Phỏng vấn",
        contextSituation: "현대인의 라이프스타일 분석 · Phân tích lối sống của người hiện đại",
        koreanSentence: "바쁜 일상 속에서도 자신만의 소확행을 찾는 사람들이 점점 늘어나고 있습니다.",
        highlightedForm: "소확행을",
        romanization:
          "Bappeun ilsang sogeseodo jasinmanui sohwakhaengeul channeun saramdeuri jeomjeom neureonago itseumnida.",
        koreanMeaning:
          "생활이 바쁘더라도 스스로를 기쁘게 하는 작은 행복을 추구하는 사람들이 많아지고 있다는 의미입니다.",
        vietnameseMeaning:
          "Ngay cả trong nhịp sống bận rộn, ngày càng có nhiều người tìm kiếm những niềm hạnh phúc nhỏ bé của riêng mình.",
        grammarAndNuanceNote:
          "Cấu trúc '-고 있다' (đang diễn ra) đi với động từ '늘어나다' (tăng lên).",
        wordBreakdown: [
          { korean: "바쁜 일상 속에서도", vietnamese: "ngay cả trong cuộc sống bận rộn", role: "Trạng ngữ" },
          { korean: "자신만의 소확행을 찾는 사람들이", vietnamese: "những người tìm niềm vui nhỏ của riêng mình", role: "Chủ ngữ" },
          { korean: "점점", vietnamese: "dần dần, ngày càng", role: "Phó từ" },
          { korean: "늘어나고 있습니다", vietnamese: "đang tăng lên", role: "Vị ngữ" },
        ],
      },
    ],
  },
  {
    id: "vocab-geuripda",
    koreanWord: "그립다",
    romanization: "geuripda",
    vietnamesePronunciation: "cư-rip-tà",
    partOfSpeech: "형용사 · Tính từ (Bất quy tắc ㅂ)",
    topikLevel: "TOPIK I · Sơ cấp 2",
    hanjaOrigin: "순우리말 · Từ thuần Hàn",
    vietnameseMeaning: "Nhớ nhung, hoài niệm, mong nhớ da diết",
    koreanDefinition: "보고 싶거나 다시 만나고 싶어 마음이 간절하다.",
    vietnameseExplanation:
      "Tính từ bất quy tắc 'ㅂ' (khi cộng nguyên âm 'ㅂ' biến thành '우': 그립다 → 그리워요, 그리운). Dùng để diễn tả nỗi nhớ sâu sắc về quê hương, gia đình, người thân hoặc kỷ niệm xưa.",
    synonyms: ["보고 싶다 (nhớ, muốn gặp)", "생각나다 (nhớ ra, chạnh nhớ)"],
    antonyms: ["잊다 (quên đi)"],
    collocations: [
      { korean: "고향이 그립다", vietnamese: "nhớ quê hương" },
      { korean: "그리운 시절", vietnamese: "thời khắc đáng nhớ, hoài niệm" },
      { korean: "가족이 그립다", vietnamese: "nhớ gia đình" },
    ],
    contextStyle: "daily",
    createdAt: "2026-09-27T07:00:00.000Z",
    masteryLevel: "learning",
    examples: [
      {
        id: 1,
        register: "해요체 · Tâm sự đời thường",
        contextSituation: "유학생의 명절 소감 · Tâm sự của du học sinh vào dịp lễ Tết",
        koreanSentence: "명절이 다가오면 고향에 계신 부모님과 집밥이 정말 그리워요.",
        highlightedForm: "그리워요",
        romanization: "Myeongjeori dagaomyeon gohyange gyesin bumonimgwa jipbabi jeongmal geuriwoyo.",
        koreanMeaning:
          "명절 때가 되면 고향에 살고 계시는 부모님과 집에서 먹던 음식이 간절히 생각나고 보고 싶다는 뜻입니다.",
        vietnameseMeaning:
          "Mỗi khi dịp lễ Tết đến gần, tôi lại vô cùng nhớ bố mẹ ở quê nhà và những bữa cơm gia đình.",
        grammarAndNuanceNote:
          "Tính từ '그립다' chia đuôi '-어요' bất quy tắc 'ㅂ' thành '그리워요'. Kính ngữ '계시다' dùng cho bố mẹ.",
        wordBreakdown: [
          { korean: "명절이 다가오면", vietnamese: "khi ngày lễ đến gần", role: "Mệnh đề điều kiện" },
          { korean: "고향에 계신 부모님과", vietnamese: "bố mẹ đang ở quê và", role: "Chủ ngữ 1" },
          { korean: "집밥이", vietnamese: "cơm nhà", role: "Chủ ngữ 2" },
          { korean: "정말 그리워요", vietnamese: "thực sự rất nhớ", role: "Vị ngữ" },
        ],
      },
      {
        id: 2,
        register: "합쇼체 · Văn viết cảm xúc",
        contextSituation: "학창 시절 회상 · Hồi tưởng thời học sinh",
        koreanSentence: "가끔은 아무 걱정 없이 친구들과 뛰어놀던 그리운 시절로 돌아가고 싶습니다.",
        highlightedForm: "그리운",
        romanization:
          "Gakkeumeun amu geokjeong eopsi chingudeulgwa ttwieonoldeon geuriun sijeollo doragago sipseumnida.",
        koreanMeaning:
          "때로는 근심 없이 친구들과 즐겁게 지냈던 옛날이 생각나서 그때로 다시 가고 싶다는 의미입니다.",
        vietnameseMeaning:
          "Đôi khi tôi muốn quay trở về khoảng thời gian đáng nhớ từng vô tư nô đùa cùng bạn bè mà không chút âu lo.",
        grammarAndNuanceNote:
          "Định ngữ của tính từ bất quy tắc 'ㅂ': '그립다 + -(으)ㄴ' → '그리운' bổ nghĩa cho '시절' (thời kỳ/thời khắc).",
        wordBreakdown: [
          { korean: "가끔은", vietnamese: "đôi khi thì", role: "Trạng ngữ" },
          { korean: "친구들과 뛰어놀던", vietnamese: "từng nô đùa cùng bạn bè", role: "Cụm định ngữ hồi tưởng" },
          { korean: "그리운 시절로", vietnamese: "về thời khắc hoài niệm đáng nhớ", role: "Cụm phương hướng" },
          { korean: "돌아가고 싶습니다", vietnamese: "muốn quay trở lại", role: "Vị ngữ" },
        ],
      },
    ],
  },
  {
    id: "vocab-inyeon",
    koreanWord: "인연",
    romanization: "inyeon",
    vietnamesePronunciation: "in-yon",
    partOfSpeech: "명사 · Danh từ",
    topikLevel: "TOPIK II · Trung cấp 3",
    hanjaOrigin: "因緣 · Âm Hán Việt: Nhân Duyên",
    vietnameseMeaning: "Nhân duyên, mối duyên gặp gỡ và gắn kết giữa người với người",
    koreanDefinition: "사람들 사이에 맺어지는 관계나 어떤 일과 관련되는 연줄.",
    vietnameseExplanation:
      "Từ Hán-Hàn (因緣 - Nhân duyên) rất được người Hàn trân trọng khi nói về những cuộc gặp gỡ tình cờ nhưng ý nghĩa trong cuộc đời, tình bạn hoặc tình yêu.",
    synonyms: ["관계 (mối quan hệ)", "유대 (sự gắn kết)"],
    antonyms: ["악연 (ác duyên, duyên nợ xấu)"],
    collocations: [
      { korean: "인연을 맺다", vietnamese: "kết duyên, tạo dựng mối nhân duyên" },
      { korean: "소중한 인연", vietnamese: "mối nhân duyên trân quý" },
      { korean: "인연이 깊다", vietnamese: "có duyên sâu đậm" },
    ],
    contextStyle: "culture",
    createdAt: "2026-09-27T06:45:00.000Z",
    masteryLevel: "reviewing",
    examples: [
      {
        id: 1,
        register: "해요체 · Giao tiếp thân mật",
        contextSituation: "새로운 친구와의 만남 · Lời chào khi kết bạn mới",
        koreanSentence: "이렇게 한국어 수업에서 만나게 된 것도 특별한 인연이라고 생각해요.",
        highlightedForm: "인연이라고",
        romanization: "Ireoke hangugeo sueobeseo mannage doen geotdo teukbyeolhan inyeonirago saenggakhaeyo.",
        koreanMeaning:
          "한국어 교실에서 서로 알게 되고 함께 공부하게 된 것이 우연이 아니라 소중한 만남이라고 여긴다는 뜻입니다.",
        vietnameseMeaning:
          "Tôi nghĩ rằng việc chúng ta tình cờ gặp được nhau trong lớp học tiếng Hàn thế này cũng là một mối nhân duyên đặc biệt.",
        grammarAndNuanceNote:
          "Cấu trúc '-게 되다' (cơ duyên dẫn đến việc gì) và 'N-(이)라고 생각하다' (nghĩ rằng là...).",
        wordBreakdown: [
          { korean: "이렇게 한국어 수업에서", vietnamese: "trong lớp tiếng Hàn như thế này", role: "Trạng ngữ" },
          { korean: "만나게 된 것도", vietnamese: "việc được gặp nhau cũng", role: "Chủ ngữ" },
          { korean: "특별한 인연이라고", vietnamese: "là một nhân duyên đặc biệt", role: "Bổ ngữ trích dẫn" },
          { korean: "생각해요", vietnamese: "tôi nghĩ rằng", role: "Vị ngữ" },
        ],
      },
      {
        id: 2,
        register: "합쇼체 · Văn phong trang trọng",
        contextSituation: "송별회 감사 인사 · Lời phát biểu tri ân trong buổi tiệc chia tay",
        koreanSentence: "여러분과 함께 일하며 맺은 소중한 인연을 앞으로도 오래 간직하겠습니다.",
        highlightedForm: "인연을",
        romanization:
          "Yeoreobungwa hamkke ilhamyeo maejeun sojunghan inyeoneul apeurodo orae ganjikhagetseumnida.",
        koreanMeaning:
          "동료들과 같이 일하면서 쌓은 귀한 관계를 앞으로도 잊지 않고 마음속에 잘 지키겠다는 의미입니다.",
        vietnameseMeaning:
          "Mối nhân duyên trân quý được kết nối khi làm việc cùng mọi người, sau này tôi cũng sẽ mãi trân trọng và gìn giữ lâu dài.",
        grammarAndNuanceNote:
          "Cụm cố định '인연을 맺다' (kết nhân duyên) và '인연을 간직하다' (lưu giữ/trân trọng mối nhân duyên).",
        wordBreakdown: [
          { korean: "여러분과 함께 일하며", vietnamese: "vừa làm việc cùng mọi người", role: "Cụm trạng ngữ" },
          { korean: "맺은 소중한 인연을", vietnamese: "mối nhân duyên trân quý đã kết nối", role: "Tân ngữ" },
          { korean: "앞으로도 오래", vietnamese: "sau này cũng lâu dài", role: "Trạng ngữ" },
          { korean: "간직하겠습니다", vietnamese: "sẽ trân trọng lưu giữ", role: "Vị ngữ" },
        ],
      },
    ],
  },
  {
    id: "vocab-haegyeolhada",
    koreanWord: "해결하다",
    romanization: "haegyeolhada",
    vietnamesePronunciation: "he-kyol-ha-đa",
    partOfSpeech: "동사 · Động từ (Ngoại động từ)",
    topikLevel: "TOPIK II · Trung cấp 3",
    hanjaOrigin: "解決 · Âm Hán Việt: Giải Quyết",
    vietnameseMeaning: "Giải quyết, tháo gỡ (vấn đề, mâu thuẫn, khó khăn)",
    koreanDefinition: "얽힌 일이나 문제를 풀어서 처리하다.",
    vietnameseExplanation:
      "Từ Hán-Hàn (解決 - Giải quyết) có âm và nghĩa tương đồng hoàn toàn với tiếng Việt. Rất hay xuất hiện trong công việc và bài thi viết TOPIK II.",
    synonyms: ["처리하다 (xử lý)", "풀다 (tháo gỡ, giải)"],
    antonyms: ["방치하다 (bỏ mặc, làm ngơ)"],
    collocations: [
      { korean: "문제를 해결하다", vietnamese: "giải quyết vấn đề" },
      { korean: "갈등을 해결하다", vietnamese: "hóa giải mâu thuẫn" },
      { korean: "원만하게 해결하다", vietnamese: "giải quyết êm đẹp, ổn thỏa" },
    ],
    contextStyle: "business",
    createdAt: "2026-09-27T06:30:00.000Z",
    masteryLevel: "learning",
    examples: [
      {
        id: 1,
        register: "해요체 · Giao tiếp công việc",
        contextSituation: "팀 회의 중 의견 조율 · Điều phối ý kiến trong cuộc họp nhóm",
        koreanSentence: "혼자 고민하지 말고 팀원들과 상의하면 문제를 더 빨리 해결할 수 있어요.",
        highlightedForm: "해결할",
        romanization:
          "Honja gominhaji malgo timwondeulgwa sanguihamyeon munjereul deo ppalli haegyeolhal su isseoyo.",
        koreanMeaning:
          "혼자서만 걱정하지 않고 동료들과 함께 이야기해 보면 어려운 일을 더 신속하게 풀 수 있다는 뜻입니다.",
        vietnameseMeaning:
          "Đừng trăn trở một mình, nếu bàn bạc cùng các thành viên trong nhóm thì bạn có thể giải quyết vấn đề nhanh hơn đấy.",
        grammarAndNuanceNote:
          "Cấu trúc '-(으)ㄹ 수 있다' (có thể làm gì) đi với cụm '문제를 해결하다' (giải quyết vấn đề).",
        wordBreakdown: [
          { korean: "혼자 고민하지 말고", vietnamese: "đừng lo nghĩ một mình mà", role: "Cụm khuyên nhủ" },
          { korean: "팀원들과 상의하면", vietnamese: "nếu bàn bạc với đồng đội", role: "Mệnh đề điều kiện" },
          { korean: "문제를 더 빨리", vietnamese: "vấn đề nhanh hơn", role: "Tân ngữ + Trạng ngữ" },
          { korean: "해결할 수 있어요", vietnamese: "có thể giải quyết", role: "Vị ngữ" },
        ],
      },
      {
        id: 2,
        register: "합쇼체 · Nghị luận TOPIK II",
        contextSituation: "환경 문제 대책 발표 · Thuyết trình giải pháp cho vấn đề môi trường",
        koreanSentence: "근본적인 원인을 먼저 파악해야 복잡한 사회 문제를 효과적으로 해결합니다.",
        highlightedForm: "해결합니다",
        romanization:
          "Geunbonjeogin wonineul meonjeo paakhaeya bokjaphan sahoe munjereul hyogwajeogeuro haegyeolhamnida.",
        koreanMeaning:
          "문제가 생긴 바탕의 이유를 먼저 정확히 알아야만 어려운 사회 문제를 제대로 처리할 수 있다는 의미입니다.",
        vietnameseMeaning:
          "Phải nắm bắt được nguyên nhân cốt lõi trước tiên thì mới giải quyết hiệu quả các vấn đề xã hội phức tạp.",
        grammarAndNuanceNote:
          "Cấu trúc điều kiện cần '-아야/어야' (phải... thì mới...) kết hợp với trạng từ '효과적으로' (một cách hiệu quả).",
        wordBreakdown: [
          { korean: "근본적인 원인을 먼저 파악해야", vietnamese: "phải nắm bắt nguyên nhân gốc rễ trước", role: "Mệnh đề điều kiện cần" },
          { korean: "복잡한 사회 문제를", vietnamese: "vấn đề xã hội phức tạp", role: "Tân ngữ" },
          { korean: "효과적으로", vietnamese: "một cách hiệu quả", role: "Trạng ngữ" },
          { korean: "해결합니다", vietnamese: "giải quyết", role: "Vị ngữ" },
        ],
      },
    ],
  },
  {
    id: "vocab-gidae",
    koreanWord: "기대",
    romanization: "gidae",
    vietnamesePronunciation: "ki-đê",
    partOfSpeech: "명사 · Danh từ (기대하다: Động từ)",
    topikLevel: "TOPIK I · Sơ cấp 2",
    hanjaOrigin: "期待 · Âm Hán Việt: Kỳ Đãi",
    vietnameseMeaning: "Sự kỳ vọng, mong đợi, trông chờ",
    koreanDefinition: "어떤 일이 원하는 대로 이루어지기를 바라며 기다림.",
    vietnameseExplanation:
      "Từ Hán-Hàn (期待 - Kỳ đãi) dùng khi mong chờ một kết quả tốt đẹp hoặc háo hức đón xem một bộ phim, sự kiện sắp diễn ra.",
    synonyms: ["희망 (hy vọng)", "바램 (mong ước)"],
    antonyms: ["실망 (sự thất vọng)"],
    collocations: [
      { korean: "기대에 부응하다", vietnamese: "đáp ứng kỳ vọng" },
      { korean: "기대가 크다", vietnamese: "kỳ vọng lớn" },
      { korean: "기대 이상이다", vietnamese: "vượt ngoài mong đợi" },
    ],
    contextStyle: "daily",
    createdAt: "2026-09-27T06:15:00.000Z",
    masteryLevel: "mastered",
    examples: [
      {
        id: 1,
        register: "해요체 · Giao tiếp hàng ngày",
        contextSituation: "새 영화 개봉 전 대화 · Trò chuyện trước khi phim mới ra rạp",
        koreanSentence: "이번 주말에 개봉하는 영화는 평점이 아주 높아서 기대가 커요.",
        highlightedForm: "기대가 커요",
        romanization: "Ibeon jumare gaebonghaneun yeonghwaneun pyeongjeomi aju nopaseo gidaega keoyo.",
        koreanMeaning:
          "이번 주말에 새로 나오는 영화에 대한 사람들의 평가가 매우 좋아서 어떤 내용일지 많이 바라고 기다려진다는 뜻입니다.",
        vietnameseMeaning:
          "Bộ phim công chiếu vào cuối tuần này có điểm đánh giá rất cao nên tôi kỳ vọng nhiều lắm.",
        grammarAndNuanceNote:
          "Cụm '기대가 크다' (kỳ vọng lớn) chia ở đuôi lịch sự thân mật là '기대가 커요'.",
        wordBreakdown: [
          { korean: "이번 주말에 개봉하는 영화는", vietnamese: "bộ phim khởi chiếu cuối tuần này", role: "Chủ ngữ" },
          { korean: "평점이 아주 높아서", vietnamese: "vì điểm đánh giá rất cao nên", role: "Mệnh đề nguyên nhân" },
          { korean: "기대가", vietnamese: "sự kỳ vọng", role: "Chủ ngữ bộ phận" },
          { korean: "커요", vietnamese: "rất lớn", role: "Vị ngữ" },
        ],
      },
      {
        id: 2,
        register: "합쇼체 · Giao tiếp công sở",
        contextSituation: "신제품 출시 결과 보고 · Báo cáo kết quả ra mắt sản phẩm mới",
        koreanSentence: "열심히 준비한 신제품이 고객들의 기대 이상의 반응을 얻어 매우 기쁩니다.",
        highlightedForm: "기대 이상의",
        romanization:
          "Yeolsimhi junbihan sinjepumi gogaekdeurui gidae isangui baneungeul eodeo maeu gippeumnida.",
        koreanMeaning:
          "정성껏 만든 새 상품이 손님들이 예상했던 것보다 훨씬 더 좋은 호응을 받아서 정말 기분이 좋다는 의미입니다.",
        vietnameseMeaning:
          "Tôi vô cùng vui mừng vì sản phẩm mới được chuẩn bị kỹ lưỡng đã nhận được phản hồi vượt ngoài mong đợi của khách hàng.",
        grammarAndNuanceNote:
          "Cụm '기대 이상' nghĩa là 'trên cả mong đợi / vượt kỳ vọng'.",
        wordBreakdown: [
          { korean: "열심히 준비한 신제품이", vietnamese: "sản phẩm mới chuẩn bị chăm chỉ", role: "Chủ ngữ" },
          { korean: "고객들의 기대 이상의 반응을 얻어", vietnamese: "nhận được phản ứng vượt kỳ vọng của khách", role: "Mệnh đề nguyên nhân" },
          { korean: "매우", vietnamese: "vô cùng", role: "Phó từ" },
          { korean: "기쁩니다", vietnamese: "vui mừng", role: "Vị ngữ" },
        ],
      },
    ],
  },
  {
    id: "vocab-jasingam",
    koreanWord: "자신감",
    romanization: "jasingam",
    vietnamesePronunciation: "cha-xin-cam",
    partOfSpeech: "명사 · Danh từ",
    topikLevel: "TOPIK II · Trung cấp 3",
    hanjaOrigin: "自信感 · Âm Hán Việt: Tự Tín Cảm",
    vietnameseMeaning: "Sự tự tin, lòng tự tin vào năng lực bản thân",
    koreanDefinition: "어떤 일을 해낼 수 있다고 스스로 굳게 믿는 마음.",
    vietnameseExplanation:
      "Từ Hán-Hàn ghép bởi '자신' (自信 - Tự tín) và hậu tố '-감' (感 - Cảm giác). Dùng phổ biến khi khích lệ ai đó trong học tập, phỏng vấn hoặc thuyết trình.",
    synonyms: ["당당함 (sự đĩnh đạc, tự tin)", "확신 (sự tin chắc)"],
    antonyms: ["열등감 (cảm giác tự ti)", "불안감 (cảm giác bất an)"],
    collocations: [
      { korean: "자신감을 갖다", vietnamese: "có sự tự tin" },
      { korean: "자신감이 넘치다", vietnamese: "tràn đầy tự tin" },
      { korean: "자신감을 얻다", vietnamese: "có thêm sự tự tin" },
    ],
    contextStyle: "topik",
    createdAt: "2026-09-27T06:00:00.000Z",
    masteryLevel: "learning",
    examples: [
      {
        id: 1,
        register: "해요체 · Khích lệ học tập",
        contextSituation: "한국어 말하기 연습 조언 · Lời khuyên khi luyện nói tiếng Hàn",
        koreanSentence: "틀리는 것을 두려워하지 말고 자신감을 가지고 한국어로 말해 보세요.",
        highlightedForm: "자신감을",
        romanization:
          "Teullineun geoseul duryeowohaji malgo jasingameul gajigo hangugeoro malhae boseyo.",
        koreanMeaning:
          "실수할까 봐 무서워하지 말고 스스로 할 수 있다는 믿음을 갖고 용기 있게 한국어로 이야기해 보라는 뜻입니다.",
        vietnameseMeaning:
          "Đừng sợ nói sai mà hãy tự tin thử trò chuyện bằng tiếng Hàn nhé.",
        grammarAndNuanceNote:
          "Cụm '자신감을 가지다' (mang sự tự tin / có lòng tự tin) kết hợp với '-아/어 보다' (thử làm gì).",
        wordBreakdown: [
          { korean: "틀리는 것을 두려워하지 말고", vietnamese: "đừng sợ việc mắc lỗi mà", role: "Cụm khuyên nhủ" },
          { korean: "자신감을 가지고", vietnamese: "hãy mang sự tự tin", role: "Cụm trạng ngữ" },
          { korean: "한국어로", vietnamese: "bằng tiếng Hàn", role: "Trạng ngữ phương tiện" },
          { korean: "말해 보세요", vietnamese: "hãy thử nói xem", role: "Vị ngữ" },
        ],
      },
      {
        id: 2,
        register: "합쇼체 · Phỏng vấn & Công việc",
        contextSituation: "면접 합격 비결 공유 · Chia sẻ bí quyết vượt qua phỏng vấn",
        koreanSentence: "철저한 사전 준비가 면접장에서 흔들리지 않는 자신감을 만들어 줍니다.",
        highlightedForm: "자신감을",
        romanization:
          "Cheoljeohan sajeon junbiga myeonjeopjangeseo heundeulliji anneun jasingameul mandeureo jumnida.",
        koreanMeaning:
          "미리 꼼꼼하게 준비하는 것이 면접을 볼 때 긴장하지 않고 당당할 수 있는 힘을 준다는 의미입니다.",
        vietnameseMeaning:
          "Sự chuẩn bị kỹ lưỡng từ trước sẽ tạo nên sự tự tin vững vàng không lay chuyển trong phòng phỏng vấn.",
        grammarAndNuanceNote:
          "Định ngữ phủ định '흔들리지 않는' (không bị lung lay/dao động) bổ nghĩa cho '자신감'.",
        wordBreakdown: [
          { korean: "철저한 사전 준비가", vietnamese: "sự chuẩn bị kỹ lưỡng từ trước", role: "Chủ ngữ" },
          { korean: "면접장에서", vietnamese: "tại phòng phỏng vấn", role: "Trạng ngữ nơi chốn" },
          { korean: "흔들리지 않는 자신감을", vietnamese: "sự tự tin không lay chuyển", role: "Tân ngữ" },
          { korean: "만들어 줍니다", vietnamese: "tạo nên cho bạn", role: "Vị ngữ" },
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
