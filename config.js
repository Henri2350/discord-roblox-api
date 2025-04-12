require('dotenv').config();

module.exports = {
    discordToken: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    mongoURI: process.env.MONGO_URI,
    robloxGroupId: process.env.ROBLOX_GROUP_ID,
    robloxCookie: process.env.ROBLOX_COOKIE,
    

    adminRoleId: "870133999417303070", // 관리자 역할 ID
    logChannelId: "870243229868650506", // 로그 채널 ID
    allowedRoleId: '870146045571657799',// 일반 유저 역할 ID

    ticketPanelChannelId: "870249381612384257", // 민원 패널이 게시될 채널
    ticketCategoryId: "870240891527381053", // 티켓이 생성될 카테고리
    ticketLogChannelId: "878563297769689118", // 티켓 저장 로그 채널

    // 로블록스 그룹 설정
    ROBLOX_GROUP_ID: process.env.ROBLOX_GROUP_ID,
    ROBLOX_COOKIE: process.env.ROBLOX_COOKIE,
    UNIVERSE_ID: process.env.UNIVERSE_ID,


    // 문의 유형별 역할 ID 매칭
    ticketRoles: {
        "기타": "1127621910944034987",
        "사업": "1127621912286208091",
        "집회": "870133999417303070",
        "후원": "1127621449113415712",
        "복구": "1127621449113415712",
        "신고": "870133999417303070"
    },

    // 문의 유형별 질문
    ticketQuestions: {
        "기타": [{ id: "reason", label: "티켓을 오픈하는 이유를 작성해 주세요." }],
        "사업": [
            { id: "founder", label: "창업자는 누구인가요?" },
            { id: "business", label: "하려는 사업은 무엇인가요?" },
            { id: "plan", label: "운영 계획은 어떻게 되나요?" },
            { id: "assets", label: "현재 소지하고 계신 자산은 얼마인가요?" },
            { id: "needs", label: "필요한 것은 무엇인가요?" }
        ],
        "집회": [
            { id: "organizer", label: "집회 개최자는 누구인가요?" },
            { id: "content", label: "집회 내용은 무엇인가요?" },
            { id: "participants", label: "집회는 몇 명 참여하나요?" },
            { id: "schedule", label: "시간과 날짜 그리고 장소를 적어 주세요." },
            { id: "items", label: "집회에 사용할 물품은 무엇인가요?" }
        ],
        "후원": [
            { id: "account", label: "계좌를 입력해 주세요." },
            { id: "support", label: "뽑기인가요? 후원인가요? ( 증거 사진을 첨부 바랍니다. )" }
        ],
        "복구": [
            { id: "proof", label: "본인임을 확인할 증거를 적어 주세요." },
            { id: "account", label: "계좌를 입력해 주세요." }
        ],
        "신고": [
            { id: "target", label: "신고 대상자 이름을 적어 주세요." },
            { id: "reason", label: "신고 사유를 적어 주세요." }
        ]
    }
};
