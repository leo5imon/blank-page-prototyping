import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const GeneratedHtmlPage = () => {
  const router = useRouter();
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (router.query.html) {
      const decodedHtml = decodeURIComponent(router.query.html);
      const cleanedHtml = decodedHtml.replace(/^```html\n|```$/g, "").trim();
      setHtml(cleanedHtml);
    } else if (router.isReady) {
      router.push("/");
    }
  }, [router.isReady, router.query.html]);

  return (
    <div className="min-h-screen w-full flex text-black">
      <div
        className="w-full h-full"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default GeneratedHtmlPage;
