// app/loading.tsx 는 app/admin/layout.tsx 바깥에 있어서 관리자 화면으로 진입할 때
// AdminHeader 없이 학생 화면 폭(max-w-5xl)으로 잠깐 그려진다. 폭이 튀는 걸 막으려고
// 관리자 세그먼트에도 같은 골격(max-w-7xl)의 로딩 경계를 둔다.
export default function AdminLoading() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <section className="rounded-lg border border-line bg-white p-6 text-sm font-bold text-slate-600 shadow-soft">
        페이지를 불러오는 중입니다.
      </section>
    </main>
  );
}
