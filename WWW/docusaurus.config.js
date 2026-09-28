// @ts-check

/** @type {import('@docusaurus/types').Config} */
module.exports = {
  title: 'MouseView.js',
  tagline: 'Eye tracking without the eyes',
  url: 'https://mouseview.org',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  favicon: 'img/favicon.ico',
  organizationName: 'u01ai11', // Usually your GitHub org/user name.
  projectName: 'mouseview.js', // Usually your repo name.
  themeConfig: {
    navbar: {
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo-pink-txt-tight.svg',
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {to: 'blog', label: 'Blog', position: 'left'},
        {
          href: 'https://mouseview.org/demo.html',
          label: 'Demo',
          position: 'right',
        },
        {
          href: 'https://github.com/u01ai11/mouseview.js',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Documentation',
              to: 'docs/',
            }
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/u01ai11/mouseview.js',
            }
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} MouseView.js`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/u01ai11/mouseview.js/edit/master/WWW/',
        },
        blog: {
          showReadingTime: true,
          onUntruncatedBlogPosts: 'ignore',
          onInlineAuthors: 'ignore',
          // Please change this to your repo.
          editUrl:
            'https://github.com/u01ai11/mouseview.js/edit/master/WWW/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  customFields:{
     heroLogo: 'img/logo-white-text-tight.svg',  
  },
  
};
