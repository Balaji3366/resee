"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { downloadCertificatePdf } from "@/lib/certificate-pdf";

interface CertificateData {
  certificateNumber: string;
  issuedAt: string;
  courseTitle: string;
}

export default function CourseCertificatePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = use(params);
  const { user } = useAuthContext();

  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/learning/courses/${courseSlug}/certificate`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Failed to load certificate.");
        }

        setCertificate(json.certificate);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load certificate.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [courseSlug]);

  const recipientName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Learner";

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/learning/${courseSlug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-amber hover:underline"
      >
        <ArrowLeft size={16} />
        Back to course
      </Link>

      {loading && (
        <div className="h-80 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      )}

      {!loading && (error || !certificate) && (
        <div className="rounded-3xl border border-amber/20 bg-panel p-8 text-center text-slate shadow-md">
          {error || "Couldn't load this certificate."}
        </div>
      )}

      {!loading && certificate && (
        <>
          <div className="rounded-3xl border-2 border-amber/30 bg-panel p-12 text-center shadow-md">
            <p className="text-sm font-bold uppercase tracking-widest text-amber">ReSee</p>
            <p className="mt-2 text-sm text-slate">Certificate of Completion</p>

            <p className="mt-8 text-sm text-slate">This certifies that</p>
            <h1 className="font-display mt-2 text-3xl font-extrabold text-bone">{recipientName}</h1>

            <p className="mt-6 text-sm text-slate">has successfully completed the course</p>
            <h2 className="font-display mt-2 text-2xl font-bold text-bone">
              {certificate.courseTitle}
            </h2>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate">
              <span>
                Issued{" "}
                {new Date(certificate.issuedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>Certificate No. {certificate.certificateNumber}</span>
            </div>
          </div>

          <button
            onClick={() =>
              downloadCertificatePdf({
                recipientName,
                courseTitle: certificate.courseTitle,
                certificateNumber: certificate.certificateNumber,
                issuedAt: certificate.issuedAt,
              })
            }
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim"
          >
            <Download size={18} />
            Download PDF
          </button>
        </>
      )}
    </div>
  );
}
