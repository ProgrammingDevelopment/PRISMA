"use client";

/**
 * PRISMA Telegram Mini App / Web App
 * Embedded within Telegram as an inline bot Web App.
 * Features: AI Chat, RT info, submit reports, finance view.
 */

import { useState, useEffect, useRef } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (fn: () => void) => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (fn: () => void) => void;
        };
        initData: string;
        initDataUnsafe: {
          user?: { id: number; first_name: string; last_name?: string; username?: string };
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        colorScheme: "light" | "dark";
      };
    };
  }
}

type Tab = "chat" | "info" | "report" | "finance";

export default function TelegramWebApp() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ firstName: string; id: number } | null>(null);
  const [isDark, setIsDark] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Telegram Web App
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      setIsDark(tg.colorScheme === "dark");

      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser) {
        setUser({ firstName: tgUser.first_name, id: tgUser.id });
      }

      tg.BackButton.show();
      tg.BackButton.onClick(() => {
        if (activeTab !== "chat") {
          setActiveTab("chat");
        } else {
          tg.close();
        }
      });
    }
  }, [activeTab]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to AI
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.slice(-10),
        }),
      });

      const data = await response.json();

      const aiMsg: ChatMessage = {
        role: "assistant",
        content: data.reply || "Maaf, tidak bisa menjawab saat ini.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Koneksi terputus. Coba lagi nanti.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const bgColor = isDark ? "#1a1a2e" : "#f8fafc";
  const textColor = isDark ? "#e2e8f0" : "#0f172a";
  const cardBg = isDark ? "#16213e" : "#ffffff";
  const primaryColor = "#3b82f6";

  return (
    <div style={{ background: bgColor, color: textColor, minHeight: "100vh", fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${primaryColor}, #1d4ed8)`,
        color: "#fff",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        <div style={{ fontSize: "28px" }}>🏘️</div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700 }}>PRISMA RT 04</div>
          <div style={{ fontSize: "12px", opacity: 0.85 }}>
            {user ? `Halo, ${user.firstName}!` : "Sistem Warga Digital"}
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{
        display: "flex",
        borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
        background: cardBg,
        overflowX: "auto",
      }}>
        {(
          [
            { id: "chat" as Tab, icon: "🤖", label: "AI Chat" },
            { id: "info" as Tab, icon: "📢", label: "Info" },
            { id: "report" as Tab, icon: "🚨", label: "Lapor" },
            { id: "finance" as Tab, icon: "💰", label: "Kas" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: "10px 8px",
              border: "none",
              background: activeTab === tab.id ? primaryColor : "transparent",
              color: activeTab === tab.id ? "#fff" : textColor,
              fontSize: "12px",
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: "pointer",
              whiteSpace: "nowrap",
              borderRadius: 0,
              transition: "all 0.2s",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "12px 16px", minHeight: "60vh" }}>
        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div style={{ display: "flex", flexDirection: "column", height: "65vh" }}>
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: "12px" }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px", opacity: 0.6 }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>🤖</div>
                  <div style={{ fontSize: "14px" }}>Tanya apa saja tentang RT 04!</div>
                  <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
                    Pengumuman, keuangan, jadwal, atau layanan warga
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "10px 14px",
                      borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: msg.role === "user" ? primaryColor : cardBg,
                      color: msg.role === "user" ? "#fff" : textColor,
                      fontSize: "14px",
                      lineHeight: "1.5",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={{ display: "flex", gap: "4px", padding: "12px" }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: primaryColor,
                        animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div style={{ display: "flex", gap: "8px", paddingTop: "8px", borderTop: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ketik pertanyaan..."
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "20px",
                  border: `1px solid ${isDark ? "#334155" : "#cbd5e1"}`,
                  background: isDark ? "#0f172a" : "#f1f5f9",
                  color: textColor,
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                style={{
                  padding: "10px 16px",
                  borderRadius: "20px",
                  border: "none",
                  background: primaryColor,
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading || !inputValue.trim() ? 0.5 : 1,
                }}
              >
                ➤
              </button>
            </div>
          </div>
        )}

        {/* Info Tab */}
        {activeTab === "info" && (
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>📢 Informasi RT 04</h3>
            {[
              { icon: "📍", label: "Sekretariat", value: "Gg. Bugis No.95, RT 04/RW 09" },
              { icon: "🏙️", label: "Kelurahan", value: "Kemayoran, Jakarta Pusat" },
              { icon: "☎️", label: "Telepon", value: "+62 878-7200-4448" },
              { icon: "🌐", label: "Website", value: "prisma-rt04.pages.dev" },
            ].map((item, i) => (
              <div key={i} style={{
                background: cardBg,
                borderRadius: "12px",
                padding: "12px 16px",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}>
                <span style={{ fontSize: "20px" }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: "11px", opacity: 0.5, textTransform: "uppercase" }}>{item.label}</div>
                  <div style={{ fontSize: "14px", fontWeight: 500 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report Tab */}
        {activeTab === "report" && (
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>🚨 Lapor Keamanan</h3>
            <p style={{ fontSize: "13px", opacity: 0.7, marginBottom: "16px" }}>
              Laporkan kejadian darurat atau mencurigakan di lingkungan RT 04.
              Gunakan perintah <strong>/report</strong> di chat bot untuk fitur lengkap.
            </p>
            <div style={{
              background: `linear-gradient(135deg, #dc2626, #b91c1c)`,
              borderRadius: "12px",
              padding: "20px",
              color: "#fff",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🆘</div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>Darurat?</div>
              <div style={{ fontSize: "12px", opacity: 0.85, marginTop: "4px" }}>
                Hubungi langsung Ketua RT atau ketik /report di bot
              </div>
            </div>
          </div>
        )}

        {/* Finance Tab */}
        {activeTab === "finance" && (
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px" }}>💰 Kas RT 04</h3>
            <p style={{ fontSize: "13px", opacity: 0.7, marginBottom: "16px" }}>
              Data keuangan transparan. Gunakan <strong>/finance</strong> di bot untuk detail lengkap.
            </p>
            <div style={{
              background: `linear-gradient(135deg, #059669, #047857)`,
              borderRadius: "12px",
              padding: "20px",
              color: "#fff",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "12px", opacity: 0.85 }}>Saldo Kas Terkini</div>
              <div style={{ fontSize: "24px", fontWeight: 700, marginTop: "8px" }}>Lihat di Bot</div>
              <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "4px" }}>
                Ketik /finance untuk data real-time
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inline CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
