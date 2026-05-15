/**
 * Pandjico: case studies from Markdown (`content/projects/*.md`), passthrough into `_site/`.
 */

function slugifyTitle(text) {
    return (
        text
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-") || "section"
    );
}

/** Ensure every <h2> has id; wrap each h2 block in <section class="case-block"> for --case layouts. */
function wrapCaseSections(html) {
    if (!html.includes("project-page project-page--case")) {
        return html;
    }
    const footerStart = html.indexOf('<p class="project-page__back project-page__back--end">');
    if (footerStart === -1) {
        return html;
    }
    const tail = html.slice(footerStart);
    const head = html.slice(0, footerStart);
    const match = /<h2\b[\s\S]*/;
    const m = head.match(match);
    if (!m) {
        return html;
    }
    const leadEnd = head.indexOf(m[0]);
    const preamble = head.slice(0, leadEnd);
    let body = head.slice(leadEnd);

    body = body.replace(/<h2\b([^>]*)>([^<]*)<\/h2>/gi, (full, attrs, headingText) => {
        if (/\bid\s*=/.test(attrs)) {
            return full.trim();
        }
        const id = slugifyTitle(headingText);
        const a = attrs.trim();
        return `<h2 id="${id}"${a ? ` ${a}` : ""}>${headingText.trim()}</h2>`;
    });

    const parts = body.split(/(?=<h2\b)/).filter(Boolean);
    const wrapped = parts
        .map((chunk) => {
            const idM = chunk.match(/<h2\b[^>]*\bid="([^"]+)"/);
            const lab = idM ? idM[1] : "case-section";
            return `\n<section class="case-block" aria-labelledby="${lab}">\n${chunk.trim()}\n</section>\n`;
        })
        .join("");

    return preamble + wrapped + tail;
}

module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy({
        css: "css",
        js: "js",
        images: "images",
        fonts: "fonts",
    });
    eleventyConfig.addPassthroughCopy("sw.js");

    eleventyConfig.addPassthroughCopy([
        "index.html",
        "station.html",
        "about.html",
        "contact.html",
        "cv.html",
        "projects/index.html",
        "projects/projects.json",
        "projects/placeholder-case-study.html",
        "projects/tactility-grounding.html",
    ]);

    eleventyConfig.addCollection("projects", (api) =>
        api.getFilteredByGlob("content/projects/**/*.md").sort((a, b) => {
            const oa = a.data.order ?? 999;
            const ob = b.data.order ?? 999;
            return oa - ob;
        }),
    );

    eleventyConfig.addTransform("case-study-sections", wrapCaseSections);

    return {
        dir: {
            input: "content",
            output: "_site",
            includes: "../_includes",
        },
        templateFormats: ["md", "njk", "html"],
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
    };
};
