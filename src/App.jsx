import { useMemo, useState } from "react";
import "./App.css";

const QUIZ = [
  {
    q: "협업 중 팀원이 답답하다. 당신의 선택은?",
    options: [
      "git push origin main --force로 세상을 바로잡는다",
      "슬랙에 'ㅇㅋ'만 37번 보낸다",
      "PR 대신 zip 파일을 카톡으로 보낸다",
      "문제를 구체화해 상황/재현/기대결과 정리하고 합의한다",
    ],
  },
  {
    q: "PR이 2,000줄이다. 리뷰해야 한다.",
    options: [
      "LGTM 쓰고 도망간다",
      "커밋 메시지에 final_final2_realfinal 붙여준다",
      "주석으로 '이건 나도 몰라'를 남긴다",
      "기능 단위로 쪼개 작은 PR로 다시 올리게 하고 핵심만 먼저 리뷰한다",
    ],
  },
  {
    q: "배포 직전에 버그 발견. 대표가 '지금 당장'이라 한다.",
    options: [
      "프로덕션에서 console.log('고쳐짐') 찍는다",
      "버그를 '기능'이라고 주장한다",
      "서버 재부팅으로 해결될 거라 믿는다",
      "롤백/핫픽스 플랜 세우고 영향도 공유 후 최소 변경으로 수정한다",
    ],
  },
  {
    q: "회의에서 '왜 이렇게 했어요?' 공격 들어옴.",
    options: [
      "'제가 한 거 아닌데요?'로 책임 분산",
      "'AI가 했어요'로 면책",
      "의자 뒤로 밀며 인터넷 끊김 연기",
      "근거(요구사항/트레이드오프/대안) 설명하고 다음 개선안 제시",
    ],
  },
  {
    q: "git 충돌 났다. 가장 빠른 해결은?",
    options: [
      "충돌 파일 전체 삭제 후 새로 작성(감으로)",
      "<<<<<<< 그대로 커밋한다 (미학)",
      "브랜치 삭제하고 '없던 일'로 한다",
      "원인 파악 → 작은 단위로 머지/리베이스 → 테스트 후 반영",
    ],
  },
  {
    q: "'왜 이렇게 느려요?' 성능 이슈 제보가 왔다.",
    options: [
      "'제 컴에서는 빨라요'로 종료",
      "CSS 애니메이션 끄면 빨라질 거라 믿는다",
      "DB에 인덱스 대신 기도를 한다",
      "측정(프로파일링/로그) → 병목 확인 → 작은 개선부터 적용",
    ],
  },
  {
    q: "요구사항이 매일 바뀐다. PM이 '그냥 유연하게~'라 한다.",
    options: [
      "하루에 브랜치 50개 파서 혼란을 극대화",
      "코드에 TODO만 300개 남긴다",
      "'그럼 앱을 없애죠?' 제안",
      "변경 기준/마감선 합의하고 우선순위(MVP)로 스코프 관리",
    ],
  },
  {
    q: "팀원이 비밀리에 main에서 직접 수정했다.",
    options: [
      "'나도 할래' 하고 같이 한다",
      "마스터 보호 규칙을 '방해물'이라 부른다",
      "git blame으로 마녀사냥 시작",
      "브랜치/PR 규칙 합의 + 보호 규칙 설정 + 리뷰/CI로 재발 방지",
    ],
  },
  {
    q: "'문서 없어?' 질문을 받았다.",
    options: [
      "'코드가 문서죠' 한마디로 끝",
      "README 대신 밈 이미지 1장 업로드",
      "노션 링크 17개 던져서 미궁으로 보낸다",
      "설치/실행/환경변수/구조/배포를 README에 최소 정리",
    ],
  },
  {
    q: "장애 났다. 팀 채널이 불타고 있다.",
    options: [
      "'제 탓 아닙니다' 선제 공지",
      "장애 시간에 맞춰 점심 인증샷 업로드",
      "서버에 '힘내'라고 말한다",
      "상황 공유(원인/영향/대응) → 임시 조치 → RCA 작성 → 재발 방지",
    ],
  },
];

export default function App() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(QUIZ.length).fill(null));
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const current = QUIZ[step];
  const doneCount = useMemo(() => answers.filter((x) => x !== null).length, [answers]);

  const pick = (idx) => {
    const next = answers.slice();
    next[step] = idx;
    setAnswers(next);
  };

  const canNext = answers[step] !== null;

  const prev = () => setStep((s) => Math.max(0, s - 1));
  const next = () => setStep((s) => Math.min(QUIZ.length - 1, s + 1));

  const reset = () => {
    setAnswers(Array(QUIZ.length).fill(null));
    setStep(0);
    setResult(null);
  };
const submit = async () => {
  setLoading(true);
  setResult(null);
  try {
    const res = await fetch("/api/grade", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    const text = await res.text(); // 먼저 텍스트로 받기
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`서버가 JSON이 아닌 응답을 줌 (HTTP ${res.status})`);
    }

    if (!res.ok || !data?.ok) throw new Error(data?.error || `HTTP ${res.status}`);

    setResult(data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    setResult({ ok: false, error: e.message });
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="page">
      <div className="container">
        <header className="header">
          <div className="badge">251010.shop</div>
          <h1>개발자 협업 밈 테스트</h1>
          <p className="sub">웃긴 답 3개 + 정상 답 1개. 너는 과연 협업의 달인인가?</p>
        </header>

        {result?.ok ? (
          <section className="card result">
            <h2 className="title">{result.title}</h2>
            <p className="desc">{result.subtitle}</p>

            <div className="scoreRow">
              <div className="scoreBox">
                <div className="scoreLabel">정답</div>
                <div className="scoreValue">
                  {result.correctCount} / {QUIZ.length}
                </div>
              </div>
              <div className="scoreBox">
                <div className="scoreLabel">점수</div>
                <div className="scoreValue">{result.percent}%</div>
              </div>
            </div>

            <details className="details">
              <summary>채점 상세 보기</summary>
              <ul>
                {result.details.map((d, i) => (
                  <li key={d.id}>
                    <b>Q{i + 1}</b> — {d.correct ? "✅" : "❌"} (picked: {d.picked}, ans:{" "}
                    {d.correctIndex})
                  </li>
                ))}
              </ul>
            </details>

            <div className="actions">
              <button className="btn" onClick={reset}>
                다시하기
              </button>
            </div>
          </section>
        ) : result?.ok === false ? (
          <section className="card">
            <h2 className="title">에러</h2>
            <p className="desc">{result.error}</p>
            <div className="actions">
              <button className="btn" onClick={reset}>
                처음으로
              </button>
            </div>
          </section>
        ) : null}

        <section className="card quiz">
          <div className="progress">
            <div className="progressText">
              진행: {doneCount}/{QUIZ.length} · 현재: {step + 1}/{QUIZ.length}
            </div>
            <div className="bar">
              <div className="barFill" style={{ width: `${(doneCount / QUIZ.length) * 100}%` }} />
            </div>
          </div>

          <h2 className="qTitle">
            Q{step + 1}. {current.q}
          </h2>

          <div className="options">
            {current.options.map((opt, idx) => {
              const selected = answers[step] === idx;
              return (
                <button
                  key={idx}
                  className={`opt ${selected ? "selected" : ""}`}
                  onClick={() => pick(idx)}
                >
                  <span className="optKey">{String.fromCharCode(65 + idx)}</span>
                  <span className="optText">{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="nav">
            <button className="btn ghost" onClick={prev} disabled={step === 0}>
              이전
            </button>

            {step < QUIZ.length - 1 ? (
              <button className="btn" onClick={next} disabled={!canNext}>
                다음
              </button>
            ) : (
              <button className="btn" onClick={submit} disabled={loading || answers.some((a) => a === null)}>
                {loading ? "채점 중..." : "제출"}
              </button>
            )}
          </div>
        </section>

        <footer className="footer">© 251010.shop · 협업은 감정이 아니라 시스템이다</footer>
      </div>
    </div>
  );
}
