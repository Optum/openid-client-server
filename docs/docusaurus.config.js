module.exports = {
    title: "OpenID Client Server",
    tagline: "An OpenId Relying Party (RP, Client) application server.",
    url: "https://github.com/Optum/openid-client-server",
    baseUrl: "/",
    onBrokenLinks: "throw",
    favicon: "img/favicon.ico",
    organizationName: "Optum", // Usually your GitHub org/user name.
    projectName: "openid-client-server", // Usually your repo name.
    themeConfig: {
        navbar: {
            title: "OpenID Client Server",
            logo: {
                alt: "OpenID Client Server",
                src: "img/logo.svg",
            },
            items: [
                {
                    to: "docs/",
                    activeBasePath: "docs",
                    label: "Docs",
                    position: "left",
                },
                {
                    href: "https://github.com/Optum/openid-client-server",
                    label: "GitHub",
                    position: "right",
                },
            ],
        },
        footer: {
            style: "dark",
            links: [
                {
                    title: "Docs",
                    items: [
                        {
                            label: "Install Guide",
                            to: "docs/",
                        },
                        {
                            label: "Getting Started",
                            to: "docs/getting-started",
                        },
                        {
                            label: "NextJS Example",
                            to: "docs/nextjs-example",
                        },
                    ],
                },
                {
                    title: "Community",
                    items: [
                        {
                            label: "GitHub",
                            href: "https://github.com/Optum",
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} Optum, Built with Docusaurus.`,
        },
    },
    presets: [
        [
            "@docusaurus/preset-classic",
            {
                docs: {
                    sidebarPath: require.resolve("./sidebars.js"),
                    // Please change this to your repo.
                    editUrl: "https://github.com/Optum/openid-client-server",
                },
                theme: {
                    customCss: require.resolve("./src/css/custom.css"),
                },
            },
        ],
    ],
};
