import { BarChart3, FileInput, Home, SearchCheck } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/", label: "대시보드", icon: Home },
  { to: "/company-upload", label: "회사 콘텐츠", icon: FileInput },
  { to: "/exam-upload", label: "평가원 업로드", icon: SearchCheck }
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-reportBg">
      <header className="no-print sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold text-ink">
              <BarChart3 className="h-6 w-6 text-brand" />
              국어 콘텐츠 적중 맵
            </div>
            <p className="mt-1 text-sm text-muted">단순 키워드 유사가 아니라, 실제 지문·작품·문항 구조·선지 판단 기준을 비교합니다.</p>
          </div>
          <nav className="flex items-center gap-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-blue-50 text-brand" : "text-gray-600 hover:bg-gray-100 hover:text-ink"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
