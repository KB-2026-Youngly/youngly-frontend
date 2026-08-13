const settlementGroups = [
  {
    groupId: 1,
    groupName: '아침 6시 기상 챌린지',
    status: 'IN_PROGRESS',
    settlements: [
      {
        settlementId: 105,
        round: 5,
        accountName: 'KB개인연금',
        accountNumber: '123-***-**4567',
        amount: 62000,
        status: 'PROCESSING',
      },
      {
        settlementId: 104,
        round: 4,
        accountName: 'KB개인연금',
        accountNumber: '123-***-**4567',
        amount: 48000,
        status: 'COMPLETED',
      },
      {
        settlementId: 103,
        round: 3,
        accountName: 'KB입출금통장',
        accountNumber: '098-***-**7654',
        amount: 32000,
        status: 'COMPLETED',
      },
      {
        settlementId: 102,
        round: 2,
        accountName: 'KB개인연금',
        accountNumber: '123-***-**4567',
        amount: 26000,
        status: 'COMPLETED',
      },
      {
        settlementId: 101,
        round: 1,
        accountName: 'KB입출금통장',
        accountNumber: '098-***-**7654',
        amount: 18000,
        status: 'COMPLETED',
      },
    ],
  },
  {
    groupId: 2,
    groupName: '매일 영단어 10개 외우기',
    status: 'ENDED',
    settlements: [
      {
        settlementId: 203,
        round: 3,
        accountName: 'KB청춘마루통장',
        accountNumber: '456-***-**9012',
        amount: 55000,
        status: 'COMPLETED',
      },
      {
        settlementId: 202,
        round: 2,
        accountName: 'KB청춘마루통장',
        accountNumber: '456-***-**9012',
        amount: 41000,
        status: 'COMPLETED',
      },
      {
        settlementId: 201,
        round: 1,
        accountName: 'KB청춘마루통장',
        accountNumber: '456-***-**9012',
        amount: 29000,
        status: 'COMPLETED',
      },
    ],
  },
  {
    groupId: 3,
    groupName: '주 3회 운동하기',
    status: 'IN_PROGRESS',
    settlements: [],
  },
]

// TODO: 정산 조회 API가 확정되면 이 함수 내부를 실제 API 호출로 교체하세요.
// 반환 형태는 { groups: SettlementGroup[] } 구조를 유지하면 화면 코드는 변경할 필요가 없습니다.
export function getMockSettlementOverview() {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve({ groups: settlementGroups.map((group) => ({ ...group })) })
    }, 350)
  })
}
