import type { ReactNode } from 'react'
import Auth from './Auth'
import { festivals, foods, sights } from './data'

const nav = [
  { href: '#sights', label: '명소' },
  { href: '#poet', label: '정지용' },
  { href: '#festival', label: '축제' },
  { href: '#food', label: '먹거리' },
  { href: '#visit', label: '오시는 길' },
]

function Placeholder({ label, className = '' }: { label: string; className?: string }) {
  return <div className={`flex items-center justify-center text-sm text-muted ${className}`}>[{label}]</div>
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium tracking-widest text-accent">{eyebrow}</p>
      <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
    </div>
  )
}

function Container({ id, className = '', children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`mx-auto max-w-[1200px] px-6 ${className}`}>
      {children}
    </section>
  )
}

export default function App() {
  return (
    <>
      <header className="border-b border-[#DDDAD0]">
        <nav className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-6 py-4">
          <a href="#top" className="text-xl font-bold text-ink">
            옥천 沃川
          </a>
          <div className="flex flex-wrap items-center gap-1">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="px-3.5 py-2.5 text-[15px] text-[#3A4643] hover:text-accent">
                {n.label}
              </a>
            ))}
            <div className="ml-2">
              <Auth />
            </div>
          </div>
        </nav>
      </header>

      <main>
        <Container id="top" className="flex flex-wrap items-center gap-12 pt-18 pb-16">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-6">
            <p className="text-[15px] font-medium tracking-widest text-accent">충청북도 옥천군</p>
            <h1 className="text-4xl leading-tight font-bold md:text-[52px]">
              시가 흐르는
              <br />
              호수의 고장, 옥천
            </h1>
            <p className="max-w-[30em] text-lg text-muted">
              금강이 굽이치고 대청호가 품은 땅. 시인 정지용의 「향수」가 태어난 마을에서 느린 하루를 보내보세요.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#sights" className="rounded-lg bg-accent px-6 py-3.5 font-medium text-white hover:bg-accent-dark">
                명소 둘러보기
              </a>
              <a
                href="#visit"
                className="rounded-lg border border-ink px-6 py-3.5 font-medium text-ink hover:bg-ink hover:text-ground"
              >
                오시는 길
              </a>
            </div>
          </div>
          <Placeholder
            label="대표 사진: 대청호와 부소담악 전경"
            className="h-[320px] min-w-0 flex-[1_1_460px] rounded-2xl bg-[#C9D8D2] md:h-[440px]"
          />
        </Container>

        <section className="bg-ink text-ground">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 py-16">
            <p className="text-xl leading-loose md:text-[26px]">
              넓은 벌 동쪽 끝으로
              <br />
              옛이야기 지즐대는 실개천이 회돌아 나가고
            </p>
            <p className="text-[15px] text-[#B9C4C0]">— 정지용, 「향수」 중에서</p>
          </div>
        </section>

        <Container id="sights" className="flex flex-col gap-8 pt-22 pb-16">
          <SectionTitle eyebrow="SIGHTS" title="옥천의 명소" />
          <div className="flex flex-wrap gap-6">
            {sights.map((s) => (
              <article key={s.name} className="flex min-w-0 flex-[1_1_340px] flex-col overflow-hidden rounded-xl bg-white">
                <Placeholder label={`사진: ${s.name}`} className="h-[200px] bg-[#DCE5E1]" />
                <div className="flex flex-col gap-1.5 px-6 pt-5 pb-7">
                  <p className="text-[13px] text-[#5C6865]">{s.area}</p>
                  <h3 className="text-xl font-bold">{s.name}</h3>
                  <p className="text-[15px] text-muted">{s.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>

        <Container id="poet" className="flex flex-wrap items-center gap-12 py-16">
          <Placeholder label="사진: 정지용 생가 초가" className="h-[360px] min-w-0 flex-[1_1_400px] rounded-2xl bg-[#E4DED0]" />
          <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-4">
            <SectionTitle eyebrow="LITERATURE" title="정지용의 고향" />
            <p className="text-[17px] text-muted">
              한국 현대시의 선구자 정지용 시인이 나고 자란 곳이 바로 옥천 구읍입니다. 복원된 생가와 바로 옆
              정지용문학관에서 시인의 삶과 작품을 만나고, 구읍 골목을 따라 걸으며 시 속 풍경을 떠올려 보세요.
            </p>
            <a href="#visit" className="font-medium text-accent hover:text-accent-dark">
              정지용 생가·문학관 안내 →
            </a>
          </div>
        </Container>

        <section id="festival" className="bg-sand">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-22">
            <SectionTitle eyebrow="FESTIVAL" title="계절마다 열리는 축제" />
            <div className="flex flex-wrap gap-6">
              {festivals.map((f, i) => (
                <div key={i} className="flex min-w-0 flex-[1_1_320px] flex-col gap-2.5 rounded-xl bg-ground p-7">
                  <p className="text-sm font-bold text-accent">{f.season}</p>
                  <h3 className="text-[22px] font-bold">{f.name}</h3>
                  <p className="text-[15px] text-muted">{f.desc}</p>
                  <p className="text-sm text-[#5C6865]">일정: {f.date}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Container id="food" className="flex flex-col gap-8 pt-22 pb-16">
          <SectionTitle eyebrow="FOOD" title="옥천에서 맛볼 것" />
          <div className="flex flex-wrap gap-6">
            {foods.map((f) => (
              <div key={f.name} className="flex min-w-0 flex-[1_1_240px] flex-col gap-3">
                <Placeholder label={`사진: ${f.name}`} className="h-[180px] rounded-xl bg-[#E8DCD3]" />
                <h3 className="text-[19px] font-bold">{f.name}</h3>
                <p className="text-[15px] text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </Container>

        <Container id="visit" className="flex flex-wrap gap-12 pt-16 pb-24">
          <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-5">
            <SectionTitle eyebrow="VISIT" title="오시는 길" />
            <div>
              <h3 className="text-[17px] font-bold">기차</h3>
              <p className="text-[15px] text-muted">경부선 옥천역 하차. 대전역에서 가깝습니다.</p>
            </div>
            <div>
              <h3 className="text-[17px] font-bold">자동차</h3>
              <p className="text-[15px] text-muted">경부고속도로 옥천IC 이용.</p>
            </div>
            <div>
              <h3 className="text-[17px] font-bold">관광 안내</h3>
              <p className="text-[15px] text-muted">[관광안내소 전화번호] · [운영 시간]</p>
            </div>
          </div>
          <Placeholder
            label="지도 영역: 카카오맵 / 네이버 지도 임베드"
            className="h-[380px] min-w-0 flex-[1_1_520px] rounded-2xl bg-[#D5DDDA]"
          />
        </Container>
      </main>

      <footer className="bg-ink text-[#B9C4C0]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-4 px-6 py-10 text-sm">
          <p className="text-lg text-ground">옥천 沃川</p>
          <p>[운영 주체 / 연락처] · © 2026</p>
        </div>
      </footer>
    </>
  )
}
