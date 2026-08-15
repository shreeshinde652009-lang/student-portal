export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t-4 border-amber-500 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="text-white font-semibold text-base mb-3 border-b border-slate-700 pb-1">
              State Common Entrance Test Cell
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Linux CS Entrance & Admission Portal. Responsible for conducting online admissions and common entrance examinations for technical and computer science education in Maharashtra.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold text-base mb-3 border-b border-slate-700 pb-1">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs">
              <li><a href="/register" className="hover:text-amber-400">New Candidate Registration</a></li>
              <li><a href="/student/login" className="hover:text-amber-400">Candidate Login</a></li>
              <li><a href="/admin/login" className="hover:text-amber-400">Admin Portal</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold text-base mb-3 border-b border-slate-700 pb-1">
              Office Address
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              8th Floor, New Excelsior Building,<br />
              A. K. Nayak Marg, Fort,<br />
              Mumbai 400001, Maharashtra.<br />
              Email: support@mahacet-linuxcs.org
            </p>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-6 pt-4 text-center text-xs text-slate-500">
          Copyright &copy; {new Date().getFullYear()} State CET Cell, Maharashtra State, Mumbai. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
