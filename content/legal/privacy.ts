import type { LegalContent } from "./types";

const UPDATED = "2026-08-01";

export const privacy: LegalContent = {
  en: {
    title: "Privacy Policy",
    updated: UPDATED,
    intro:
      "What I Own keeps a private record of the things you own. This page explains what it stores, where that lives, and what it never does with it. It is written to be read, not to be impressive.",
    sections: [
      {
        heading: "What is stored",
        body: [
          "Your account: the email address you sign up with, the name you give, and an encrypted form of your password. We never see your password itself.",
          "Your inventory: whatever you record about your possessions — names, brands, notes, prices, dates, locations, tags, and the photographs you take.",
          "A little usage detail about your own items, such as when you last marked something as used, because the app answers questions like which things you have not touched in a year.",
        ],
      },
      {
        heading: "What is not collected",
        body: [
          "No advertising or cross-site tracking, and no third-party analytics. Nothing you record is sold, rented, or shared with anyone for marketing.",
          "Your inventory is not used to build a profile of you, and it is not readable by other users. Every row is scoped to your account by the database itself, not merely by application code.",
        ],
      },
      {
        heading: "Photographs and AI features",
        body: [
          "When you ask the app to read a photo, a receipt, or a voice note, that file is sent to our AI provider (Google, via the Gemini API) to extract the items in it, and the result comes back as a draft for you to confirm. This happens only when you take that action.",
          "If you never use those features, no image or recording of yours is sent anywhere except our own storage.",
          "Handling by that provider is governed by their terms, which we do not control. If that matters to you, the app is fully usable with the AI features untouched — you can enter everything by hand.",
        ],
      },
      {
        heading: "Where it lives",
        body: [
          "Data is held in a Supabase project (a hosted PostgreSQL database and file storage), and the site is served by Netlify. Both are processors acting on our behalf.",
          "Photographs are kept in a private storage bucket. They are not publicly addressable; the app fetches them through short-lived signed links.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "Only what the app needs to work: a session cookie so you stay signed in, and small preferences for your chosen language and theme. There are no advertising or tracking cookies.",
        ],
      },
      {
        heading: "Keeping it, and deleting it",
        body: [
          "Your data stays until you remove it. You can delete any item, photograph, or location at any time.",
          "Your entire account, and everything in it, can be deleted on request.",
          "Backups may hold a copy for a short period after deletion before they rotate out.",
        ],
      },
      {
        heading: "Children",
        body: [
          "This app is not intended for children under 13, and accounts should not be created for them.",
        ],
      },
      {
        heading: "Changes to this page",
        body: [
          "If this policy changes in a way that matters, the date above changes and you will be told in the app rather than quietly.",
        ],
      },
      {
        heading: "Getting in touch",
        body: [
          "You can ask to see or delete everything held about you. Contact details will be published here before this app is open beyond its first users.",
        ],
      },
    ],
  },
  zh: {
    title: "隐私政策",
    updated: UPDATED,
    intro:
      "「我拥有什么」用于私人记录你所拥有的物品。本页说明应用会保存什么、数据存放在哪里，以及绝不会对这些数据做什么。这里写的是给人读的，不是用来堆砌辞藻的。",
    sections: [
      {
        heading: "会保存什么",
        body: [
          "你的账号：注册所用的邮箱地址、你填写的姓名，以及经过加密处理的密码。我们无法看到你的密码原文。",
          "你的物品清单：你记录的一切内容 —— 名称、品牌、备注、价格、日期、存放位置、标签，以及你拍摄的照片。",
          "少量与你自己物品相关的使用信息，例如你上次标记使用的时间，因为应用需要回答「哪些东西一年都没动过」这类问题。",
        ],
      },
      {
        heading: "不会收集什么",
        body: [
          "没有广告或跨站跟踪，也没有第三方统计分析。你记录的任何内容都不会被出售、出租，或为营销目的分享给任何人。",
          "你的清单不会被用来给你建立画像，其他用户也无法读取。每一行数据都由数据库本身限定归属于你的账号，而不仅仅依赖应用代码。",
        ],
      },
      {
        heading: "照片与 AI 功能",
        body: [
          "当你请求应用识别照片、收据或语音记录时，该文件会被发送给我们的 AI 服务方（Google，通过 Gemini API）以提取其中的物品，结果会作为草稿返回，由你确认。只有你主动执行该操作时才会发生。",
          "如果你从不使用这些功能，你的图像与录音除了存放在我们自己的存储中，不会被发送到任何其他地方。",
          "该服务方的处理方式受其自身条款约束，我们无法控制。如果你介意这一点，完全不使用 AI 功能也能正常使用本应用 —— 所有内容都可以手动录入。",
        ],
      },
      {
        heading: "数据存放在哪里",
        body: [
          "数据保存在 Supabase 项目中（托管的 PostgreSQL 数据库与文件存储），网站由 Netlify 提供服务。两者都是代表我们进行处理的服务方。",
          "照片保存在私有存储空间中，无法通过公开地址访问；应用通过有效期很短的签名链接读取它们。",
        ],
      },
      {
        heading: "Cookie",
        body: [
          "仅限应用运行所必需的部分：用于保持登录状态的会话 Cookie，以及记录你所选语言与主题的少量偏好设置。没有任何广告或跟踪 Cookie。",
        ],
      },
      {
        heading: "保存与删除",
        body: [
          "你的数据会一直保留，直到你删除它。你可以随时删除任何物品、照片或位置。",
          "你的整个账号及其中的所有内容，均可根据你的请求删除。",
          "在删除后的一段较短时间内，备份中可能仍存有副本，直至备份轮换过期。",
        ],
      },
      {
        heading: "儿童",
        body: ["本应用不面向 13 岁以下儿童，也不应为其创建账号。"],
      },
      {
        heading: "本页的变更",
        body: [
          "如果本政策发生实质性变更，上方日期会随之更新，并且会在应用内告知你，而不会悄然改动。",
        ],
      },
      {
        heading: "联系我们",
        body: [
          "你可以要求查看或删除我们持有的与你相关的全部数据。联系方式将在本应用向首批用户以外开放之前公布于此。",
        ],
      },
    ],
  },
};
