import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ShieldCheck,
  FileText,
  Edit3,
  Upload,
  LogIn,
  LogOut,
  Plus,
  Eye,
  CalendarDays,
  Menu,
  X,
  School,
  CheckCircle2,
  AlertCircle,
  Save,
  History,
  Lock,
  Cloud,
  WifiOff,
  UserCog,
  Settings,
  Download,
  ClipboardCheck,
  RefreshCw,
} from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className = "", children }) {
  return <div className={cn("border border-slate-200 bg-white", className)}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function Button({ className = "", variant = "default", disabled = false, children, ...props }) {
  const variantClass =
    variant === "outline"
      ? "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
      : variant === "ghost"
        ? "bg-transparent text-slate-700 hover:bg-slate-100"
        : variant === "destructive"
          ? "bg-red-600 text-white hover:bg-red-700"
          : "bg-slate-900 text-white hover:bg-slate-800";

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variantClass,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

/*
  동탄국제고법령정보센터 — Supabase 중심 버전

  핵심 구조
  - 게시물: Supabase public.rules 테이블
  - 사이트 위젯: Supabase public.site_settings 테이블
  - 로그인: Supabase Auth
  - 관리자 권한: public.admin_users 테이블에 등록된 이메일인지 확인
  - 보안: Supabase RLS 정책이 최종 권한을 제한함

  미리보기/샌드박스 환경
  - import.meta.env는 사용하지 않음
  - window.__APP_ENV__에 Supabase 값이 없으면 localStorage 데모 모드로 작동

  온라인 연결 예시: public/index.html 또는 배포 템플릿에 앱 로드 전 추가
  <script>
    window.__APP_ENV__ = {
      VITE_SUPABASE_URL: "https://your-project.supabase.co",
      VITE_SUPABASE_ANON_KEY: "your-anon-key"
    };
  </script>
*/

const RULES_STORAGE_KEY = "dongtan-law-center-rules-fallback-v7";
const SETTINGS_STORAGE_KEY = "dongtan-law-center-settings-fallback-v7";
const LOCAL_ADMIN_PASSWORD = "dtg.law.go";

const DEFAULT_SETTINGS = {
  announcementEnabled: true,
  announcementText: "공지: 교내 규칙은 검토 중·게시됨·폐지됨 상태까지 공개되며, 비공개 문서는 관리자만 열람할 수 있습니다.",
  badgeText: "공개 열람 · 관리자 게시 · Supabase DB 연동",
  heroTitle: "학교 규칙을 누구나 쉽게 찾고, 관리자는 안전하게 게시합니다.",
  heroDescription:
    "국가법령정보센터처럼 교내 규칙을 분류, 검색, 열람할 수 있는 반응형 웹사이트입니다. 게시된 규칙은 누구나 볼 수 있고, 관리자는 Supabase Auth 로그인 후 작성·수정·게시·비공개 전환·삭제를 할 수 있습니다.",
  noticeTitle: "운영 안내",
  noticeText:
    "게시 전 규칙명, 적용 대상, 시행일, 담당 부서를 확인하세요. 민감한 개인정보는 규칙 본문에 포함하지 않는 것을 원칙으로 합니다.",
};

const INITIAL_RULES = [
  {
    id: 1,
    title: "학생생활규정",
    category: "대의원회",
    status: "게시됨",
    updatedAt: "2026-05-12T00:00:00+00:00",
    updatedBy: "관리자",
    summary: "학생의 기본 생활 태도, 교내 질서, 복장, 전자기기 사용, 상벌 기준 등을 정리한 규정입니다.",
    content:
      "제1조 목적: 이 규정은 학생의 자율적이고 책임 있는 학교생활을 지원하기 위해 필요한 사항을 정한다.\n\n제2조 기본 원칙: 모든 학생은 타인의 권리를 존중하며, 안전하고 평화로운 교육환경 조성에 협력해야 한다.\n\n제3조 전자기기 사용: 수업 중 전자기기 사용은 교사의 교육적 허가가 있는 경우에 한한다.",
    history: [{ date: "2026-05-12", action: "최초 게시", user: "관리자" }],
  },
  {
    id: 2,
    title: "학생자치회 운영 규정",
    category: "학생자치회",
    status: "게시됨",
    updatedAt: "2026-04-28T00:00:00+00:00",
    updatedBy: "관리자",
    summary: "학생자치회의 구성, 선거, 의장단 권한, 회의 운영, 의결 절차를 정리한 규정입니다.",
    content:
      "제1조 목적: 학생자치회의 민주적 운영과 학생 의견 반영 절차를 명확히 하기 위해 이 규정을 둔다.\n\n제2조 구성: 학생자치회는 회장단, 대의원회, 각 부서로 구성한다.\n\n제3조 회의: 정기회의는 월 1회 개최함을 원칙으로 한다.",
    history: [{ date: "2026-04-28", action: "최초 게시", user: "관리자" }],
  },
  {
    id: 3,
    title: "교내 시설 건의 규정",
    category: "시설 건의",
    status: "게시됨",
    updatedAt: "2026-03-17T00:00:00+00:00",
    updatedBy: "관리자",
    summary: "도서관, 자습실, 체육관, 특별실 등 교내 시설 건의 절차와 안전 수칙을 담은 규정입니다.",
    content:
      "제1조 목적: 학교 시설의 안전하고 공정한 이용을 위해 필요한 절차를 정한다.\n\n제2조 예약: 특별실 사용은 담당 교사의 승인 후 가능하다.\n\n제3조 책임: 이용자는 시설을 훼손하지 않도록 주의해야 하며, 사용 후 정리정돈을 해야 한다.",
    history: [{ date: "2026-03-17", action: "최초 게시", user: "관리자" }],
  },
  {
    id: 4,
    title: "평가 이의신청 절차",
    category: "학사 건의",
    status: "검토 중",
    updatedAt: "2026-02-21T00:00:00+00:00",
    updatedBy: "관리자",
    summary: "시험 및 수행평가 결과에 대한 이의신청 기간, 신청 방법, 처리 절차를 안내합니다.",
    content:
      "제1조 목적: 평가 결과에 대한 학생의 정당한 의견 제출권을 보장하기 위해 이 절차를 둔다.\n\n제2조 신청 기간: 평가 결과 공개 후 3일 이내에 신청할 수 있다.\n\n제3조 처리: 담당 교사는 신청 내용을 검토하고 필요한 경우 평가관리위원회에 회부한다.",
    history: [{ date: "2026-02-21", action: "초안 저장", user: "관리자" }],
  },
];

const CATEGORIES = ["전체", "대의원회", "학생자치회", "감사위원회", "학사 건의", "선거", "시설 건의", "토론 사항", "관습", "학생 생활", "안건 발의", "문서 서식", "기타"];
const ADMIN_TABS = ["규칙 관리", "위젯 관리", "운영 관리"];
const STATUSES = ["검토 중", "게시됨", "비공개", "폐지됨"];

function getRuntimeEnvValue(key, fallback = "") {
  try {
    if (
      typeof window !== "undefined" &&
      window.__APP_ENV__ &&
      Object.prototype.hasOwnProperty.call(window.__APP_ENV__, key) &&
      typeof window.__APP_ENV__[key] === "string"
    ) {
      return window.__APP_ENV__[key];
    }
  } catch {
    return fallback;
  }
  return fallback;
}

const SUPABASE_URL = getRuntimeEnvValue("VITE_SUPABASE_URL");
const SUPABASE_ANON_KEY = getRuntimeEnvValue("VITE_SUPABASE_ANON_KEY");
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function safeJsonParse(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function getStoredValue(key, fallback) {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const saved = localStorage.getItem(key);
    return saved ? safeJsonParse(saved, fallback) : fallback;
  } catch {
    return fallback;
  }
}

function saveStoredValue(key, value) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장소가 차단된 환경에서는 현재 화면 상태만 유지한다.
  }
}

function normalizeSettings(value) {
  return {
    ...DEFAULT_SETTINGS,
    ...(value && typeof value === "object" ? value : {}),
  };
}

function normalizeSettingsFromDb(row) {
  if (!row) return DEFAULT_SETTINGS;
  return normalizeSettings({
    announcementEnabled: row.announcement_enabled,
    announcementText: row.announcement_text,
    badgeText: row.badge_text,
    heroTitle: row.hero_title,
    heroDescription: row.hero_description,
    noticeTitle: row.notice_title,
    noticeText: row.notice_text,
  });
}

function normalizeSettingsToDb(settings) {
  const safe = normalizeSettings(settings);
  return {
    id: "main",
    announcement_enabled: Boolean(safe.announcementEnabled),
    announcement_text: safe.announcementText,
    badge_text: safe.badgeText,
    hero_title: safe.heroTitle,
    hero_description: safe.heroDescription,
    notice_title: safe.noticeTitle,
    notice_text: safe.noticeText,
    updated_by: "관리자",
  };
}

function normalizeRuleFromDb(row) {
  return {
    id: row.id,
    title: row.title || "",
    category: row.category || "기타",
    status: row.status || "검토 중",
    updatedAt: row.updated_at || new Date().toISOString(),
    updatedBy: row.updated_by || "관리자",
    summary: row.summary || "",
    content: row.content || "",
    history: Array.isArray(row.history) ? row.history : [],
  };
}

function normalizeRuleToDb(rule) {
  return {
    title: rule.title,
    category: rule.category,
    status: rule.status,
    summary: rule.summary || "",
    content: rule.content,
    updated_by: rule.updatedBy || "관리자",
    history: Array.isArray(rule.history) ? rule.history : [],
  };
}

async function getSupabaseClient() {
  if (!USE_SUPABASE) return null;
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

function withTimeout(promise, ms = 12000, label = "요청") {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(`${label} 시간이 초과되었습니다.`)), ms);
    }),
  ]);
}

function getVisibleRulesForUser(rules, options) {
  const { isAdmin = false, category = "전체", query = "" } = options || {};
  const normalizedQuery = String(query).trim().toLowerCase();

  return rules.filter((rule) => {
    const openToPublic = rule.status !== "비공개" || isAdmin;
    const matchesCategory = category === "전체" || rule.category === category;
    const keyword = `${rule.title || ""} ${rule.category || ""} ${rule.summary || ""} ${rule.content || ""}`.toLowerCase();
    const matchesQuery = normalizedQuery.length === 0 || keyword.includes(normalizedQuery);
    return openToPublic && matchesCategory && matchesQuery;
  });
}

function createUpdatedHistory(action, previousHistory, extra = {}) {
  return [{ date: today(), action, user: "관리자", ...extra }, ...(Array.isArray(previousHistory) ? previousHistory : [])];
}

function getRestoreStatusFromHistory(history) {
  if (!Array.isArray(history)) return "게시됨";
  const privateEntry = history.find((item) => item?.action === "비공개 전환" && item?.previousStatus);
  return privateEntry?.previousStatus || "게시됨";
}

function runSelfTests() {
  const testRules = [
    { id: 1, title: "공개 규칙", category: "대의원회", status: "게시됨", summary: "공개", content: "본문" },
    { id: 2, title: "비공개 규칙", category: "시설 건의", status: "검토 중", summary: "비공개", content: "본문" },
  ];

  console.assert(getRuntimeEnvValue("THIS_ENV_SHOULD_NOT_EXIST", "fallback") === "fallback", "env fallback test failed");
  console.assert(USE_SUPABASE === Boolean(SUPABASE_URL && SUPABASE_ANON_KEY), "supabase flag test failed");
  console.assert(getVisibleRulesForUser(testRules, { isAdmin: false }).length === 1, "public visibility test failed");
  console.assert(getVisibleRulesForUser(testRules, { isAdmin: true }).length === 2, "admin visibility test failed");
  console.assert(getVisibleRulesForUser(testRules, { isAdmin: true, category: "시설 건의" }).length === 1, "category filter test failed");
  console.assert(CATEGORIES.includes("대의원회") && CATEGORIES.includes("토론 사항") && CATEGORIES.includes("관습"), "new categories test failed");
  console.assert(CATEGORIES.includes("학생 생활") && CATEGORIES.includes("안건 발의") && CATEGORIES.includes("문서 서식"), "added categories test failed");
  console.assert(getVisibleRulesForUser(testRules, { isAdmin: true, query: "비공개" }).length === 1, "query filter test failed");
  console.assert(normalizeSettingsFromDb(normalizeSettingsToDb({ heroTitle: "테스트" })).heroTitle === "테스트", "settings db normalization test failed");
  console.assert(normalizeSettings({ announcementEnabled: false }).announcementEnabled === false, "announcement enabled settings test failed");
  console.assert(normalizeSettingsFromDb(normalizeSettingsToDb({ announcementText: "공지 테스트" })).announcementText === "공지 테스트", "announcement text db test failed");
  console.assert(normalizeRuleFromDb({ ...normalizeRuleToDb(INITIAL_RULES[0]), id: 1, updated_at: "2026-01-01", history: null }).history.length === 0, "history fallback test failed");
  console.assert(createUpdatedHistory("테스트", null).length === 1, "history creation test failed");
  console.assert(createUpdatedHistory("비공개 전환", [], { previousStatus: "폐지됨" })[0].previousStatus === "폐지됨", "previous status history test failed");
  console.assert(getRestoreStatusFromHistory([{ action: "비공개 전환", previousStatus: "검토 중" }]) === "검토 중", "restore previous status test failed");
}

if (typeof window !== "undefined" && !window.__DONGTAN_RULES_TESTED__) {
  window.__DONGTAN_RULES_TESTED__ = true;
  runSelfTests();
}

function StatusBadge({ status }) {
  const isPublished = status === "게시됨";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
        isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {isPublished ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
      {status}
    </span>
  );
}

function App() {
  const [supabase, setSupabase] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rules, setRules] = useState(() => getStoredValue(RULES_STORAGE_KEY, INITIAL_RULES));
  const [settings, setSettings] = useState(() => normalizeSettings(getStoredValue(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS)));
  const [settingsForm, setSettingsForm] = useState(() => normalizeSettings(getStoredValue(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS)));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [selectedId, setSelectedId] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [isSavingRule, setIsSavingRule] = useState(false);
  const [deleteConfirmRule, setDeleteConfirmRule] = useState(null);
  const [isDeletingRule, setIsDeletingRule] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminTab, setAdminTab] = useState("규칙 관리");
  const [lastBackupAt, setLastBackupAt] = useState("");
  const [syncMessage, setSyncMessage] = useState(USE_SUPABASE ? "Supabase 연결 중" : "로컬 데모 모드");
  const [form, setForm] = useState({
    title: "",
    category: "대의원회",
    status: "검토 중",
    summary: "",
    content: "",
  });

  const selectedRule = useMemo(() => {
    return rules.find((rule) => rule.id === selectedId) || rules.find((rule) => rule.status === "게시됨") || rules[0] || null;
  }, [rules, selectedId]);

  const visibleRules = useMemo(
    () => getVisibleRulesForUser(rules, { isAdmin, category, query }),
    [rules, query, category, isAdmin]
  );

  const publishedCount = rules.filter((rule) => rule.status === "게시됨").length;
  const reviewCount = rules.filter((rule) => rule.status !== "게시됨").length;

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (!USE_SUPABASE) saveStoredValue(RULES_STORAGE_KEY, rules);
  }, [rules]);

  useEffect(() => {
    if (!USE_SUPABASE) saveStoredValue(SETTINGS_STORAGE_KEY, settings);
  }, [settings]);

  useEffect(() => {
    if (!selectedId && rules.length > 0) {
      const firstPublic = rules.find((rule) => rule.status === "게시됨") || rules[0];
      setSelectedId(firstPublic.id);
    }
  }, [rules, selectedId]);

  async function initializeApp() {
    setIsLoading(true);

    if (!USE_SUPABASE) {
      setSyncMessage("로컬 데모 모드: Supabase 연결값이 없어 브라우저 저장소를 사용합니다.");
      setIsLoading(false);
      return;
    }

    try {
      const client = await getSupabaseClient();
      setSupabase(client);

      const { data: sessionData, error: sessionError } = await withTimeout(
        client.auth.getSession(),
        10000,
        "세션 확인"
      );
      if (sessionError) throw sessionError;

      const user = sessionData?.session?.user || null;
      setAuthUser(user);

      // 새로고침 직전에 관리자로 로그인되어 있었다면 Supabase 세션이 남아 있으므로
      // 관리자 상태를 복원한다. 로그아웃 상태였다면 일반 사용자 상태로 남는다.
      const adminStatus = user ? await checkAdmin(client, user.email) : false;
      setIsAdmin(adminStatus);

      await Promise.all([loadSettings(client), loadRules(client, adminStatus)]);

      client.auth.onAuthStateChange((_event, session) => {
        const nextUser = session?.user || null;
        setAuthUser(nextUser);

        // Supabase auth 콜백 안에서 곧바로 다른 Supabase 요청을 await하면
        // 일부 환경에서 로그인 상태 갱신이 멈춘 것처럼 보일 수 있다.
        // 그래서 다음 tick으로 넘겨 안전하게 관리자 권한과 목록을 갱신한다.
        window.setTimeout(async () => {
          const nextAdminStatus = nextUser ? await checkAdmin(client, nextUser.email) : false;
          setIsAdmin(nextAdminStatus);
          await loadRules(client, nextAdminStatus);
        }, 0);
      });

      setSyncMessage("Supabase DB 연결 완료");
    } catch (error) {
      console.error(error);
      setSyncMessage("Supabase 연결 실패: 로컬 데모 모드로 전환됨");
    } finally {
      setIsLoading(false);
    }
  }

  async function checkAdmin(client, email) {
    if (!client || !email) return false;

    // 우선 SQL 함수 public.is_admin()으로 확인한다.
    // 이 방식은 admin_users 테이블의 RLS 정책 때문에 권한 확인이 막히는 문제를 줄인다.
    try {
      const { data, error } = await withTimeout(client.rpc("is_admin"), 10000, "관리자 권한 확인");
      if (!error && typeof data === "boolean") return data;
      if (error) console.error(error);
    } catch (error) {
      console.error(error);
    }

    // fallback: 직접 테이블 확인
    try {
      const { data, error } = await withTimeout(
        client.from("admin_users").select("email").eq("email", email).maybeSingle(),
        10000,
        "관리자 목록 확인"
      );
      if (error) {
        console.error(error);
        return false;
      }
      return Boolean(data?.email);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async function loadRules(client = supabase, adminStatus = isAdmin) {
    if (!USE_SUPABASE || !client) return;

    try {
      let queryBuilder = client.from("rules").select("*").order("updated_at", { ascending: false });
      if (!adminStatus) queryBuilder = queryBuilder.neq("status", "비공개");
      const { data, error } = await queryBuilder;
      if (error) throw error;
      const nextRules = (data || []).map(normalizeRuleFromDb);
      setRules(nextRules);
      if (nextRules.length > 0 && !nextRules.some((rule) => rule.id === selectedId)) {
        setSelectedId(nextRules[0].id);
      }
    } catch (error) {
      console.error(error);
      setSyncMessage("규칙 불러오기 실패: RLS 정책과 테이블을 확인하세요.");
    }
  }

  async function loadSettings(client = supabase) {
    if (!USE_SUPABASE || !client) return;

    try {
      const { data, error } = await client.from("site_settings").select("*").eq("id", "main").maybeSingle();
      if (error) throw error;
      const nextSettings = normalizeSettingsFromDb(data);
      setSettings(nextSettings);
      setSettingsForm(nextSettings);
    } catch (error) {
      console.error(error);
      setSyncMessage("사이트 설정 불러오기 실패: site_settings 테이블을 확인하세요.");
    }
  }

  const resetForm = () => {
    setForm({ title: "", category: "대의원회", status: "검토 중", summary: "", content: "" });
    setEditingId(null);
    setFormError("");
  };

  const openCreateForm = () => {
    resetForm();
    setShowEditor(true);
    setAdminTab("규칙 관리");
  };

  const openEditForm = (rule) => {
    setForm({
      title: rule.title || "",
      category: rule.category || "대의원회",
      status: rule.status || "검토 중",
      summary: rule.summary || "",
      content: rule.content || "",
    });
    setEditingId(rule.id);
    setShowEditor(true);
    setAdminTab("규칙 관리");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    if (!USE_SUPABASE) {
      if (password === LOCAL_ADMIN_PASSWORD) {
        setIsAdmin(true);
        setLoginOpen(false);
        setAdminEmail("");
        setPassword("");
        setSyncMessage("로컬 데모 관리자 모드");
        setIsLoggingIn(false);
        return;
      }
      setLoginError("관리자 비밀번호가 올바르지 않습니다.");
      setIsLoggingIn(false);
      return;
    }

    if (!adminEmail.trim()) {
      setLoginError("관리자 이메일을 입력해 주세요.");
      setIsLoggingIn(false);
      return;
    }

    if (!password.trim()) {
      setLoginError("관리자 비밀번호를 입력해 주세요.");
      setIsLoggingIn(false);
      return;
    }

    try {
      const client = supabase || (await getSupabaseClient());
      if (!client) throw new Error("supabase_client_missing");
      if (!supabase) setSupabase(client);

      const { data, error } = await withTimeout(
        client.auth.signInWithPassword({
          email: adminEmail.trim(),
          password,
        }),
        12000,
        "로그인"
      );
      if (error) throw error;

      const user = data?.user || null;
      const adminStatus = user ? await checkAdmin(client, user.email) : false;
      if (!adminStatus) {
        await client.auth.signOut();
        setAuthUser(null);
        setIsAdmin(false);
        throw new Error("not_admin");
      }

      setAuthUser(user);
      setIsAdmin(true);
      setLoginOpen(false);
      setAdminEmail("");
      setPassword("");
      await Promise.all([loadSettings(client), loadRules(client, true)]);
      setSyncMessage("관리자 로그인 완료");
    } catch (error) {
      console.error(error);
      const message = String(error?.message || "");
      if (message.includes("Invalid login credentials")) {
        setLoginError("이메일 또는 비밀번호가 올바르지 않습니다. Supabase Authentication 계정을 확인하세요.");
      } else if (message.includes("not_admin")) {
        setLoginError("로그인 계정은 맞지만 admin_users 테이블에 등록된 관리자가 아닙니다.");
      } else if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
        setLoginError("Supabase에 연결할 수 없습니다. API URL과 Publishable key를 확인하세요.");
      } else {
        setLoginError(`관리자 로그인 실패: ${message || "알 수 없는 오류"}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    const client = supabase;

    // 화면 상태를 먼저 바꿔서 버튼이 즉시 반응하도록 한다.
    setAuthUser(null);
    setIsAdmin(false);
    setShowEditor(false);
    setLoginOpen(false);
    resetForm();
    setSyncMessage(USE_SUPABASE ? "로그아웃 처리 중" : "로컬 데모 모드");

    if (USE_SUPABASE && client) {
      try {
        await client.auth.signOut();
      } catch (error) {
        console.error(error);
        setSyncMessage("로그아웃은 화면에 반영됐지만 Supabase 세션 종료 중 오류가 발생했습니다.");
      }

      try {
        await loadRules(client, false);
        await loadSettings(client);
        setSyncMessage("로그아웃 완료");
      } catch (error) {
        console.error(error);
        setSyncMessage("로그아웃 완료. 공개 규칙 새로고침은 실패했습니다.");
      }
      return;
    }

    setSyncMessage("로컬 데모 모드");
  };

  const handleSaveRule = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!isAdmin) {
      setFormError("관리자 로그인 상태에서만 저장할 수 있습니다. 다시 로그인해 주세요.");
      return;
    }

    if (!form.title.trim()) {
      setFormError("규칙 제목을 입력해야 저장할 수 있습니다.");
      return;
    }

    if (!form.content.trim()) {
      setFormError("규칙 본문을 입력해야 저장할 수 있습니다.");
      return;
    }

    setIsSavingRule(true);

    const historyAction = editingId ? "규칙 수정" : form.status === "게시됨" ? "작성 및 게시" : "초안 저장";
    const existingRule = rules.find((rule) => rule.id === editingId);
    const payload = normalizeRuleToDb({
      ...existingRule,
      title: form.title.trim(),
      category: form.category,
      status: form.status,
      summary: form.summary.trim() || "요약이 아직 작성되지 않았습니다.",
      content: form.content.trim(),
      updatedBy: authUser?.email || "관리자",
      history: createUpdatedHistory(historyAction, existingRule?.history),
    });

    if (USE_SUPABASE && supabase) {
      try {
        if (editingId) {
          const { error } = await supabase.from("rules").update(payload).eq("id", editingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("rules").insert(payload);
          if (error) throw error;
        }
        await loadRules(supabase, true);
        setSyncMessage("Supabase에 규칙 저장 완료");
      } catch (error) {
        console.error(error);
        setSyncMessage("규칙 저장 실패: RLS 정책과 로그인 상태를 확인하세요.");
        setFormError(`규칙 저장 실패: ${error?.message || "Supabase 저장 권한 또는 연결 상태를 확인하세요."}`);
        setIsSavingRule(false);
        return;
      }
    } else {
      const localRule = {
        id: editingId || Date.now(),
        title: payload.title,
        category: payload.category,
        status: payload.status,
        summary: payload.summary,
        content: payload.content,
        updatedAt: new Date().toISOString(),
        updatedBy: payload.updated_by,
        history: payload.history,
      };
      setRules((prev) => (editingId ? prev.map((rule) => (rule.id === editingId ? localRule : rule)) : [localRule, ...prev]));
      setSelectedId(localRule.id);
    }

    resetForm();
    setShowEditor(false);
    setIsSavingRule(false);
  };

  const handlePublishToggle = async (ruleId) => {
    if (!isAdmin) return;
    const target = rules.find((rule) => rule.id === ruleId);
    if (!target) return;
    const nextStatus = target.status === "비공개" ? getRestoreStatusFromHistory(target.history) : "비공개";
    const payload = {
      status: nextStatus,
      updated_by: authUser?.email || "관리자",
      history:
        target.status === "비공개"
          ? createUpdatedHistory("공개 전환", target.history, { restoredStatus: nextStatus })
          : createUpdatedHistory("비공개 전환", target.history, { previousStatus: target.status }),
    };

    if (USE_SUPABASE && supabase) {
      try {
        const { error } = await supabase.from("rules").update(payload).eq("id", ruleId);
        if (error) throw error;
        await loadRules(supabase, true);
        setSyncMessage("게시 상태 변경 완료");
      } catch (error) {
        console.error(error);
        setSyncMessage("게시 상태 변경 실패");
      }
      return;
    }

    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId
          ? { ...rule, status: nextStatus, updatedAt: new Date().toISOString(), updatedBy: "관리자", history: payload.history }
          : rule
      )
    );
  };

  const openDeleteConfirm = (rule) => {
    if (!isAdmin || !rule) return;
    setDeleteConfirmRule(rule);
  };

  const closeDeleteConfirm = () => {
    if (isDeletingRule) return;
    setDeleteConfirmRule(null);
  };

  const handleDeleteRule = async () => {
    if (!isAdmin || !deleteConfirmRule) return;

    const ruleId = deleteConfirmRule.id;
    setIsDeletingRule(true);

    if (USE_SUPABASE && supabase) {
      try {
        const { error } = await supabase.from("rules").delete().eq("id", ruleId);
        if (error) throw error;

        await loadRules(supabase, true);

        if (selectedId === ruleId) {
          setSelectedId(null);
        }

        setDeleteConfirmRule(null);
        setSyncMessage("규칙 삭제 완료");
      } catch (error) {
        console.error(error);
        setSyncMessage("규칙 삭제 실패");
      } finally {
        setIsDeletingRule(false);
      }

      return;
    }

    setRules((prev) => prev.filter((rule) => rule.id !== ruleId));

    if (selectedId === ruleId) {
      setSelectedId(null);
    }

    setDeleteConfirmRule(null);
    setIsDeletingRule(false);
  };

  const handleSaveSettings = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    const nextSettings = normalizeSettings({
      announcementEnabled: Boolean(settingsForm.announcementEnabled),
      announcementText: settingsForm.announcementText.trim() || DEFAULT_SETTINGS.announcementText,
      badgeText: settingsForm.badgeText.trim() || DEFAULT_SETTINGS.badgeText,
      heroTitle: settingsForm.heroTitle.trim() || DEFAULT_SETTINGS.heroTitle,
      heroDescription: settingsForm.heroDescription.trim() || DEFAULT_SETTINGS.heroDescription,
      noticeTitle: settingsForm.noticeTitle.trim() || DEFAULT_SETTINGS.noticeTitle,
      noticeText: settingsForm.noticeText.trim() || DEFAULT_SETTINGS.noticeText,
    });

    if (USE_SUPABASE && supabase) {
      try {
        const { error } = await supabase.from("site_settings").upsert(normalizeSettingsToDb(nextSettings));
        if (error) throw error;
        await loadSettings(supabase);
        setSyncMessage("사이트 위젯 설정 저장 완료");
      } catch (error) {
        console.error(error);
        setSyncMessage("사이트 설정 저장 실패");
      }
      return;
    }

    setSettings(nextSettings);
    setSettingsForm(nextSettings);
  };

  const handleResetSettings = async () => {
    setSettingsForm(DEFAULT_SETTINGS);
    if (!isAdmin) return;
    if (USE_SUPABASE && supabase) {
      try {
        const { error } = await supabase.from("site_settings").upsert(normalizeSettingsToDb(DEFAULT_SETTINGS));
        if (error) throw error;
        await loadSettings(supabase);
      } catch (error) {
        console.error(error);
      }
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const handleExportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      mode: USE_SUPABASE ? "supabase" : "local-demo",
      settings,
      rules,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `dongtan-law-center-backup-${today()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setLastBackupAt(new Date().toLocaleString());
  };

  const handleRefresh = async () => {
    if (USE_SUPABASE && supabase) {
      await Promise.all([loadSettings(supabase), loadRules(supabase, isAdmin)]);
      setSyncMessage("최신 데이터 새로고침 완료");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {settings.announcementEnabled && settings.announcementText && (
        <div className="border-b border-slate-800 bg-slate-950 px-4 py-2 text-center text-sm font-semibold text-white sm:px-6 lg:px-8">
          <span className="inline-flex max-w-7xl items-center justify-center leading-6">
            {settings.announcementText}
          </span>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <School size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Dongtan Global High School</p>
              <h1 className="text-lg font-bold sm:text-xl">동탄국제고법령정보센터</h1>
            </div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" className="gap-2">
              <Eye size={16} /> 누구나 열람
            </Button>
            <Button variant="outline" onClick={handleRefresh} className="gap-2 rounded-xl" disabled={!USE_SUPABASE || isLoading}>
              <RefreshCw size={16} /> 새로고침
            </Button>
            {isAdmin ? (
              <Button onClick={handleLogout} className="gap-2 rounded-xl">
                <LogOut size={16} /> 관리자 나가기
              </Button>
            ) : (
              <Button onClick={() => setLoginOpen(true)} className="gap-2 rounded-xl" variant="outline">
                <LogIn size={16} /> 관리자 로그인
              </Button>
            )}
          </nav>

          <button className="rounded-xl border border-slate-200 p-2 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="메뉴 열기">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="space-y-2 border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <Button variant="outline" onClick={handleRefresh} className="w-full gap-2 rounded-xl" disabled={!USE_SUPABASE || isLoading}>
              <RefreshCw size={16} /> 새로고침
            </Button>
            {isAdmin ? (
              <Button onClick={handleLogout} className="w-full gap-2 rounded-xl">
                <LogOut size={16} /> 관리자 모드 종료
              </Button>
            ) : (
              <Button onClick={() => setLoginOpen(true)} className="w-full gap-2 rounded-xl" variant="outline">
                <LogIn size={16} /> 관리자 로그인
              </Button>
            )}
          </div>
        )}
      </header>

      {deleteConfirmRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-red-600">삭제 확인</p>
                <h2 className="mt-1 text-2xl font-black">정말 삭제하시겠습니까?</h2>
              </div>
              <button
                onClick={closeDeleteConfirm}
                className="rounded-xl p-2 hover:bg-slate-100"
                aria-label="삭제 확인 창 닫기"
                disabled={isDeletingRule}
              >
                <X />
              </button>
            </div>

            <div className="rounded-2xl bg-red-50 p-4 text-sm leading-6 text-red-800">
              <p className="font-bold">삭제할 문서</p>
              <p className="mt-1">{deleteConfirmRule.title}</p>
              <p className="mt-3 text-xs">
                삭제하면 일반 관리자 화면에서 바로 복구할 수 없습니다. 필요한 경우 먼저 운영 관리에서 백업을 내려받아 주세요.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={closeDeleteConfirm} disabled={isDeletingRule} className="rounded-xl">
                취소
              </Button>
              <Button type="button" variant="destructive" onClick={handleDeleteRule} disabled={isDeletingRule} className="rounded-xl">
                {isDeletingRule ? "삭제 중..." : "한번 더 삭제"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {loginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">관리자 인증</p>
                <h2 className="text-2xl font-black">로그인</h2>
              </div>
              <button onClick={() => setLoginOpen(false)} className="rounded-xl p-2 hover:bg-slate-100" aria-label="로그인 창 닫기">
                <X />
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              {USE_SUPABASE && (
                <div className="relative">
                  <UserCog className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(event) => setAdminEmail(event.target.value)}
                    placeholder="관리자 이메일"
                    className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-500"
                    required={USE_SUPABASE}
                  />
                </div>
              )}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="관리자 비밀번호"
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-500"
                  required
                />
              </div>
              {loginError && <p className="text-sm font-semibold text-red-600">{loginError}</p>}
              <Button type="submit" disabled={isLoggingIn} className="w-full rounded-xl">
                {isLoggingIn ? "로그인 중..." : "로그인"}
              </Button>
              <p className="text-xs leading-5 text-slate-500">
                Supabase 연결 시 Authentication에 만든 관리자 계정으로 로그인합니다. 연결값이 없는 미리보기에서는 로컬 데모 모드로 실행됩니다.
              </p>
            </form>
          </motion.div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="rounded-[2rem] bg-slate-900 p-7 text-white shadow-xl sm:p-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-slate-100">
              <ShieldCheck size={16} /> {settings.badgeText}
            </div>
            <h2 className="max-w-3xl text-3xl font-black leading-tight sm:text-5xl">{settings.heroTitle}</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{settings.heroDescription}</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <Card className="rounded-3xl border-none shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-2xl bg-slate-100 p-3"><FileText size={24} /></div>
                <div><p className="text-sm text-slate-500">전체 규칙</p><p className="text-2xl font-black">{rules.length}건</p></div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-none shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-2xl bg-green-100 p-3 text-green-700"><Upload size={24} /></div>
                <div><p className="text-sm text-slate-500">공개 게시</p><p className="text-2xl font-black">{publishedCount}건</p></div>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border-none shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700"><Edit3 size={24} /></div>
                <div><p className="text-sm text-slate-500">검토/비공개</p><p className="text-2xl font-black">{reviewCount}건</p></div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[390px_1fr]">
          <aside className="space-y-5">
            <Card className="rounded-3xl border-none shadow-sm">
              <CardContent className="p-5">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="규칙명, 조항, 키워드 검색" className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-500" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {CATEGORIES.map((item) => (
                    <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${category === item ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2 font-black">
                  {USE_SUPABASE ? <Cloud size={18} /> : <WifiOff size={18} />} 저장 상태
                </div>
                <p className="text-sm leading-6 text-slate-600">{isLoading ? "불러오는 중..." : syncMessage}</p>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {USE_SUPABASE ? "Supabase Auth와 DB를 중심으로 작동합니다." : "현재 미리보기에는 Supabase 연결값이 없어 로컬 데모 모드로 실행됩니다."}
                </p>
              </CardContent>
            </Card>

            {isAdmin && (
              <Card className="rounded-3xl border-none shadow-sm">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div><p className="text-sm font-semibold text-slate-500">관리자 기능</p><h3 className="text-xl font-black">운영 패널</h3></div>
                    <Button onClick={openCreateForm} className="gap-2 rounded-xl"><Plus size={16} /> 새 규칙</Button>
                  </div>

                  <div className="mb-4 grid grid-cols-3 gap-2">
                    {ADMIN_TABS.map((tab) => (
                      <button key={tab} onClick={() => setAdminTab(tab)} className={`rounded-2xl px-3 py-2 text-xs font-bold transition ${adminTab === tab ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                        {tab}
                      </button>
                    ))}
                  </div>

                  {adminTab === "규칙 관리" && (
                    <div>
                      <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-xs leading-5 text-slate-600">
                        <div className="mb-1 flex items-center gap-2 font-bold text-slate-800"><UserCog size={15} /> Supabase 규칙 관리</div>
                        저장, 수정, 삭제는 Supabase rules 테이블에 반영되며, 최종 권한은 RLS 정책으로 제한됩니다.
                      </div>

                      {showEditor && (
                        <form onSubmit={handleSaveRule} className="space-y-3">
                          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="규칙 제목" required className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500" />
                          <div className="grid grid-cols-2 gap-3">
                            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500">
                              {CATEGORIES.filter((item) => item !== "전체").map((item) => <option key={item}>{item}</option>)}
                            </select>
                            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500">
                              {STATUSES.map((item) => <option key={item}>{item}</option>)}
                            </select>
                          </div>
                          <textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="규칙 요약" rows={3} className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500" />
                          <textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="본문을 입력하세요. 예: 제1조 목적, 제2조 적용 범위..." rows={7} required className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500" />
                          {formError && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{formError}</p>}
                          <div className="grid grid-cols-2 gap-2">
                            <Button type="submit" disabled={isSavingRule} className="gap-2 rounded-xl"><Save size={16} /> {isSavingRule ? "저장 중..." : editingId ? "수정 저장" : "저장"}</Button>
                            <Button type="button" variant="outline" onClick={() => { resetForm(); setShowEditor(false); }} className="rounded-xl">취소</Button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {adminTab === "위젯 관리" && (
                    <form onSubmit={handleSaveSettings} className="space-y-3">
                      <div className="rounded-2xl bg-slate-100 p-4 text-xs leading-5 text-slate-600">
                        <div className="mb-1 flex items-center gap-2 font-bold text-slate-800"><Settings size={15} /> 사이트 위젯 설정</div>
                        저장하면 Supabase site_settings 테이블의 main 설정이 변경됩니다. 상단 공지사항 바도 여기에서 수정합니다.
                      </div>
                      <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={Boolean(settingsForm.announcementEnabled)}
                          onChange={(event) => setSettingsForm({ ...settingsForm, announcementEnabled: event.target.checked })}
                          className="h-4 w-4"
                        />
                        사이트 최상단 공지사항 바 표시
                      </label>
                      <textarea
                        value={settingsForm.announcementText}
                        onChange={(event) => setSettingsForm({ ...settingsForm, announcementText: event.target.value })}
                        placeholder="상단 공지사항 문구"
                        rows={2}
                        className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                      />
                      <input value={settingsForm.badgeText} onChange={(event) => setSettingsForm({ ...settingsForm, badgeText: event.target.value })} placeholder="상단 배지 문구" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500" />
                      <input value={settingsForm.heroTitle} onChange={(event) => setSettingsForm({ ...settingsForm, heroTitle: event.target.value })} placeholder="위젯 제목" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500" />
                      <textarea value={settingsForm.heroDescription} onChange={(event) => setSettingsForm({ ...settingsForm, heroDescription: event.target.value })} placeholder="위젯 설명" rows={5} className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500" />
                      <input value={settingsForm.noticeTitle} onChange={(event) => setSettingsForm({ ...settingsForm, noticeTitle: event.target.value })} placeholder="운영 안내 제목" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500" />
                      <textarea value={settingsForm.noticeText} onChange={(event) => setSettingsForm({ ...settingsForm, noticeText: event.target.value })} placeholder="운영 안내 내용" rows={4} className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500" />
                      <div className="grid grid-cols-2 gap-2">
                        <Button type="submit" className="gap-2 rounded-xl"><Save size={16} /> 위젯 저장</Button>
                        <Button type="button" variant="outline" onClick={handleResetSettings} className="rounded-xl">기본값 복원</Button>
                      </div>
                    </form>
                  )}

                  {adminTab === "운영 관리" && (
                    <div className="space-y-4">
                      <div className="rounded-2xl bg-slate-100 p-4 text-xs leading-5 text-slate-600">
                        <div className="mb-1 flex items-center gap-2 font-bold text-slate-800"><ClipboardCheck size={15} /> 운영 체크리스트</div>
                        <ul className="mt-2 list-inside list-disc space-y-1">
                          <li>Supabase Authentication에 관리자 계정이 있는지 확인</li>
                          <li>admin_users 테이블에 관리자 이메일이 있는지 확인</li>
                          <li>RLS 정책이 켜져 있는지 확인</li>
                          <li>비공개 문서만 일반 사용자에게 숨겨짐</li>
                          <li>검토 중·게시됨·폐지됨 문서는 일반 사용자도 열람 가능</li>
                          <li>게시 전 개인정보, 학생 실명, 민감한 징계 내용 제거</li>
                        </ul>
                      </div>
                      <Button onClick={handleExportBackup} className="w-full gap-2 rounded-xl"><Download size={16} /> 현재 데이터 백업 내보내기</Button>
                      {lastBackupAt && <p className="text-xs text-slate-500">마지막 백업: {lastBackupAt}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {visibleRules.length === 0 ? (
                <Card className="rounded-3xl border-none shadow-sm"><CardContent className="p-6 text-center text-sm text-slate-500">검색 결과가 없습니다.</CardContent></Card>
              ) : (
                visibleRules.map((rule) => (
                  <button key={rule.id} onClick={() => setSelectedId(rule.id)} className={`w-full rounded-3xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${selectedRule?.id === rule.id ? "border-slate-900 bg-white shadow-md" : "border-transparent bg-white shadow-sm"}`}>
                    <div className="mb-3 flex items-start justify-between gap-3"><h3 className="font-black leading-snug">{rule.title}</h3><StatusBadge status={rule.status} /></div>
                    <p className="line-clamp-2 text-sm leading-6 text-slate-600">{rule.summary}</p>
                    <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500"><span>{rule.category}</span><span className="flex items-center gap-1"><CalendarDays size={14} /> {formatDate(rule.updatedAt)}</span></div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section>
            {selectedRule ? (
              <Card className="min-h-[650px] rounded-[2rem] border-none shadow-sm">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{selectedRule.category}</span><StatusBadge status={selectedRule.status} /></div>
                      <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{selectedRule.title}</h2>
                      <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500"><CalendarDays size={16} /> 최종 수정일: {formatDate(selectedRule.updatedAt)}<span className="hidden sm:inline">·</span><span>수정자: {selectedRule.updatedBy || "관리자"}</span></p>
                    </div>

                    {isAdmin && (
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => openEditForm(selectedRule)} className="gap-2 rounded-xl"><Edit3 size={16} /> 수정</Button>
                        <Button variant="outline" onClick={() => handlePublishToggle(selectedRule.id)} className="rounded-xl">{selectedRule.status === "비공개" ? "공개 전환" : "비공개 전환"}</Button>
                        <Button variant="destructive" onClick={() => openDeleteConfirm(selectedRule)} className="rounded-xl">삭제</Button>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 rounded-3xl bg-slate-100 p-5"><p className="text-sm font-bold text-slate-500">요약</p><p className="mt-2 leading-7 text-slate-700">{selectedRule.summary}</p></div>

                  <article className="prose prose-slate mt-8 max-w-none">
                    <h3 className="text-xl font-black">본문</h3>
                    <div className="whitespace-pre-line rounded-3xl border border-slate-200 bg-white p-6 leading-8 text-slate-800">{selectedRule.content}</div>
                  </article>

                  {isAdmin && (
                    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5">
                      <div className="mb-4 flex items-center gap-2 font-black"><History size={18} /> 수정·게시 이력</div>
                      <div className="space-y-2">
                        {(selectedRule.history || []).map((item, index) => (
                          <div key={`${item.date}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                            <span className="font-semibold text-slate-800">{item.action}</span><span className="text-slate-500">{item.date} · {item.user}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 rounded-3xl border border-dashed border-slate-300 p-5 text-sm leading-6 text-slate-500"><strong className="text-slate-700">{settings.noticeTitle}:</strong> {settings.noticeText}</div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-[2rem] border-none shadow-sm"><CardContent className="p-10 text-center text-slate-500">선택된 규칙이 없습니다.</CardContent></Card>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default App;
