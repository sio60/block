export async function onRequestPost({ request }) {
  try {
    const body = await request.json().catch(() => ({}));
    const answers = Array.isArray(body.answers) ? body.answers : [];

const correct = [1, 0, 2, 0, 1, 3, 2, 2, 0, 1];

const weights = Array(10).fill(10);
    const total = weights.reduce((a, b) => a + b, 0);

    let score = 0;
    let correctCount = 0;

    const details = correct.map((ans, i) => {
      const picked = answers[i];
      const ok = picked === ans;
      if (ok) {
        correctCount += 1;
        score += weights[i];
      }
      return {
        id: `q${i + 1}`,
        picked: picked ?? null,
        correctIndex: ans,
        correct: ok,
      };
    });

    const percent = Math.round((score / total) * 100);

    let title = "협업 위험 인물";
    let subtitle = "팀이 너를 두려워한다… (농담)";

    if (percent === 100) {
      title = "협업의 달인";
      subtitle = "PR도 예쁘고 커뮤니케이션도 깔끔함. 팀플 MVP.";
    } else if (percent >= 80) {
      title = "프로 팀플러";
      subtitle = "대부분 정답. 가끔 밈이 튀어나오는 편.";
    } else if (percent >= 50) {
      title = "평범한 개발자";
      subtitle = "실수도 하고 수습도 하는… 인간미 있는 타입.";
    }

    return new Response(
      JSON.stringify({ ok: true, correctCount, percent, title, subtitle, details }),
      { headers: { "content-type": "application/json; charset=utf-8" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e?.message || "unknown error" }),
      { status: 500, headers: { "content-type": "application/json; charset=utf-8" } }
    );
  }
}

export function onRequestGet() {
  return new Response(
    JSON.stringify({ ok: false, error: "POST only" }),
    { status: 405, headers: { "content-type": "application/json; charset=utf-8" } }
  );
}
