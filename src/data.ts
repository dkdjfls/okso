export type Sight = { name: string; area: string; desc: string }
export type Food = { name: string; desc: string }
export type Festival = { season: string; name: string; desc: string; date: string }

export const sights: Sight[] = [
  { name: '부소담악', area: '군북면', desc: '대청호 위로 병풍처럼 솟은 바위 절벽. 호수를 따라 이어지는 산책길이 아름답습니다.' },
  { name: '용암사 운해', area: '옥천읍', desc: '장령산 자락의 사찰에서 새벽 운해와 일출을 볼 수 있는 명소입니다.' },
  { name: '둔주봉 한반도 지형', area: '안남면', desc: '전망대에 오르면 금강 물줄기가 빚은 한반도 모양의 지형이 내려다보입니다.' },
  { name: '장령산 자연휴양림', area: '군서면', desc: '맑은 계곡과 숲길, 숙박 시설을 갖춘 휴식 공간입니다.' },
  { name: '정지용 생가·문학관', area: '옥천읍 구읍', desc: '시인이 태어난 초가와 그의 문학 세계를 담은 전시관.' },
  { name: '대청호 둘레길', area: '옥천 일대', desc: '호수를 곁에 두고 걷는 길. 구간마다 다른 풍경을 만납니다.' },
]

export const festivals: Festival[] = [
  { season: '봄 · 5월', name: '지용제', desc: '정지용 시인을 기리는 문학 축제. 시 낭송, 백일장, 공연이 구읍 일대에서 열립니다.', date: '[YYYY.MM.DD – MM.DD]' },
  { season: '여름', name: '옥천 포도·복숭아 축제', desc: '옥천의 대표 과일을 맛보고 직접 구매할 수 있는 여름 축제입니다.', date: '[YYYY.MM.DD – MM.DD]' },
  { season: '[계절]', name: '[축제 이름]', desc: '[축제 소개 문구]', date: '[YYYY.MM.DD – MM.DD]' },
]

export const foods: Food[] = [
  { name: '생선국수', desc: '민물고기를 푹 고아 낸 걸쭉한 국물에 국수를 말아 먹는 옥천의 향토 음식.' },
  { name: '도리뱅뱅이', desc: '작은 민물고기를 팬에 둥글게 둘러 바삭하게 졸여 낸 별미.' },
  { name: '옥천 포도', desc: '일교차 큰 기후에서 자라 당도가 높은 여름 과일.' },
  { name: '옥천 복숭아', desc: '포도와 함께 옥천을 대표하는 여름 특산물.' },
]
