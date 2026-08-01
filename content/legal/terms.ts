import type { LegalContent } from "./types";

const UPDATED = "2026-08-01";

export const terms: LegalContent = {
  en: {
    title: "Terms of Service",
    updated: UPDATED,
    intro:
      "These are the terms for using What I Own. Using the app means accepting them.",
    sections: [
      {
        heading: "What the service is",
        body: [
          "A private inventory of your own physical possessions: you record what you own and where it is, and the app helps you find it again.",
          "It is not a valuation service, an insurance record, or a legal record of ownership. Prices and totals are the ones you typed in.",
        ],
      },
      {
        heading: "Your account",
        body: [
          "Use an email address you actually control — it is the only way to recover access if you forget your password.",
          "Keep your password to yourself. Anything done through your account is treated as done by you.",
          "One account per person, for your own use.",
        ],
      },
      {
        heading: "Your content stays yours",
        body: [
          "Everything you record — item details, notes, photographs — remains yours. We claim no ownership of it.",
          "You give us only the permission needed to run the service: to store your content, and to process it so the app can display, search, and organise it for you. That permission ends when you delete the content or your account.",
        ],
      },
      {
        heading: "Fair use",
        body: [
          "Do not use the app to store anything unlawful, and do not use it to infringe anyone's rights.",
          "Do not attempt to reach another user's data, probe or work around the access controls, or automate bulk requests against the service.",
        ],
      },
      {
        heading: "AI features can be wrong",
        body: [
          "The app can read photographs, receipts, and voice notes to suggest items. These suggestions are guesses and are sometimes wrong — that is why every one is shown to you as a draft to confirm before it is saved.",
          "Nothing the AI produces should be relied on as a record of what you own, what it is worth, or what it cost. Check it.",
        ],
      },
      {
        heading: "Availability",
        body: [
          "The service is provided as it is, without a guarantee that it will be available, uninterrupted, or free of faults.",
          "Features may change, and the app may be suspended or discontinued. If it is discontinued, you will be given reasonable notice and a way to export your data.",
          "Keep your own copies of anything you cannot afford to lose. Photographs in particular exist in one place unless you keep them elsewhere too.",
        ],
      },
      {
        heading: "Limits on liability",
        body: [
          "To the extent the law allows, we are not liable for indirect or consequential loss, or for loss of data beyond what our own negligence caused.",
          "Nothing here limits rights you have that cannot be limited by agreement.",
        ],
      },
      {
        heading: "Ending it",
        body: [
          "You may stop using the app and delete your account whenever you like.",
          "We may suspend an account that is breaking these terms, and will say why unless doing so is unlawful.",
        ],
      },
      {
        heading: "Governing law",
        body: [
          "The governing law, and the courts responsible for any dispute, will be stated here before this app is open beyond its first users.",
        ],
      },
      {
        heading: "Changes and contact",
        body: [
          "If these terms change materially, the date above changes and you will be told in the app. Continuing to use it after that means accepting the new version.",
          "Contact details will be published here before this app is open beyond its first users.",
          "This document is published in English and Chinese. Where the two differ, the English version governs.",
        ],
      },
    ],
  },
  zh: {
    title: "服务条款",
    updated: UPDATED,
    intro: "以下是使用「我拥有什么」的条款。使用本应用即表示接受这些条款。",
    sections: [
      {
        heading: "本服务是什么",
        body: [
          "一份属于你自己的实物清单：你记录拥有什么、放在哪里，应用帮助你日后重新找到它。",
          "它不是估价服务、保险凭证，也不是所有权的法律凭证。价格与合计金额都是你自己录入的数字。",
        ],
      },
      {
        heading: "你的账号",
        body: [
          "请使用你确实能收到邮件的邮箱地址 —— 忘记密码时，这是唯一的找回途径。",
          "请勿将密码告知他人。通过你的账号进行的操作，均视为你本人的操作。",
          "每人一个账号，供本人使用。",
        ],
      },
      {
        heading: "你的内容仍归你所有",
        body: [
          "你记录的一切 —— 物品信息、备注、照片 —— 仍然属于你。我们不主张对其拥有任何所有权。",
          "你仅授予我们运行本服务所必需的许可：保存你的内容，并对其进行处理，以便应用为你展示、搜索和整理这些内容。当你删除内容或账号时，该许可即行终止。",
        ],
      },
      {
        heading: "合理使用",
        body: [
          "请勿使用本应用保存任何违法内容，也不得用于侵犯他人权利。",
          "请勿尝试访问其他用户的数据、试探或绕过访问控制，或对本服务发起自动化的批量请求。",
        ],
      },
      {
        heading: "AI 功能可能出错",
        body: [
          "应用可以识别照片、收据和语音记录来推测物品。这些推测只是猜测，有时会出错 —— 因此每一条都会先以草稿形式呈现给你确认，之后才会保存。",
          "AI 生成的任何内容都不应被当作你拥有什么、值多少钱或花了多少钱的凭据。请自行核对。",
        ],
      },
      {
        heading: "服务可用性",
        body: [
          "本服务按现状提供，不保证持续可用、不中断或没有缺陷。",
          "功能可能变更，应用也可能被暂停或终止。如果终止服务，我们会提前合理通知，并提供导出数据的方式。",
          "对于你无法承受丢失的内容，请自行留存副本。照片尤其如此 —— 除非你另行备份，它们只存在于一处。",
        ],
      },
      {
        heading: "责任限制",
        body: [
          "在法律允许的范围内，我们不对间接或后果性损失负责，也不对超出我们自身过失所致的数据损失负责。",
          "本条款不限制依法不能通过约定加以限制的权利。",
        ],
      },
      {
        heading: "终止",
        body: [
          "你可以随时停止使用本应用并删除账号。",
          "对于违反本条款的账号，我们可以暂停其使用；除法律不允许的情形外，我们会说明原因。",
        ],
      },
      {
        heading: "适用法律",
        body: [
          "适用法律以及负责处理争议的法院，将在本应用向首批用户以外开放之前于此说明。",
        ],
      },
      {
        heading: "变更与联系",
        body: [
          "如本条款发生实质性变更，上方日期会随之更新，并会在应用内告知你。此后继续使用即表示接受新版本。",
          "联系方式将在本应用向首批用户以外开放之前公布于此。",
          "本文件以英文和中文发布。两者如有差异，以英文版本为准。",
        ],
      },
    ],
  },
};
