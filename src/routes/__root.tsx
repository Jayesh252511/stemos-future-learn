import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useNavigate,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { MessageSquare, X } from "lucide-react";
import { LanguageProvider } from "@/lib/i18n";

import appCss from "../styles.css?url";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="text-muted-foreground mb-6">Something went wrong on our end. You can try refreshing or head back home.</p>
        <div className="bg-red-500/10 text-red-500 text-left p-4 rounded-md mb-6 text-xs font-mono overflow-auto max-w-full">
          <strong>{error.message}</strong>
          <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "STEMOS — The Future of STEM Learning" },
      { name: "description", content: "Smart personalized STEM learning platform for Math, Physics, Chemistry, and Programming." },
      { name: "author", content: "STEMOS" },
      { property: "og:title", content: "STEMOS — The Future of STEM Learning" },
      { property: "og:description", content: "Smart personalized STEM learning platform for Math, Physics, Chemistry, and Programming." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@stemos" },
      { name: "twitter:title", content: "STEMOS — The Future of STEM Learning" },
      { name: "twitter:description", content: "Smart personalized STEM learning platform for Math, Physics, Chemistry, and Programming." },
      { property: "og:image", content: "/og-image.png" },
      { name: "twitter:image", content: "/og-image.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthSync() {
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);
  return null;
}

function GlobalNotificationSystem() {
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    senderId?: string;
    senderName?: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const channel = supabase.channel("live-arena-global", {
      config: { presence: { key: "user" }, broadcast: { self: false } }
    });

    channel
      .on("broadcast", { event: "chat" }, (payload) => {
        if (window.location.pathname !== "/arena") {
          setNotification({
            title: `Global Chat — @${payload.payload.username}`,
            message: payload.payload.content,
          });
        }
      })
      .on("broadcast", { event: "private_message" }, (payload) => {
        supabase.auth.getSession().then(({ data }) => {
          const currentUserId = data.session?.user?.id;
          if (currentUserId && payload.payload.to_id === currentUserId) {
            setNotification({
              title: `Private Message from @${payload.payload.msg.username}`,
              message: payload.payload.msg.content,
              senderId: payload.payload.from_id,
              senderName: payload.payload.msg.username,
            });
          }
        });
      })
      .on("broadcast", { event: "friend_request" }, (payload) => {
        supabase.auth.getSession().then(({ data }) => {
          const currentUserId = data.session?.user?.id;
          if (currentUserId && payload.payload.to_id === currentUserId) {
            setNotification({
              title: "Study Buddy Request 👥",
              message: `@${payload.payload.from_username} sent you a study buddy request!`,
            });
          }
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-card/95 backdrop-blur-md border border-primary/20 rounded-[2rem] shadow-2xl p-5 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => {
          navigate({ to: "/arena" });
          setNotification(null);
        }}>
          <h4 className="text-sm font-bold text-foreground truncate">{notification.title}</h4>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
          <span className="text-[10px] text-primary font-bold tracking-wider mt-2.5 block hover:underline">CLICK TO OPEN CHAT</span>
        </div>
        <button onClick={() => setNotification(null)} className="text-muted-foreground hover:text-foreground transition flex-shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <AuthSync />
        <Outlet />
        <Toaster position="top-right" richColors closeButton />
        <GlobalNotificationSystem />
      </QueryClientProvider>
    </LanguageProvider>
  );
}
