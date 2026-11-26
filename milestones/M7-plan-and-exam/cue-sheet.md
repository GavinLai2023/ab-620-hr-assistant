# One-page pre-exam sheet: discriminator cues, English-Chinese (2026-11-25)

How to use: read it through once during the day of 11-26. The left column is the keyword to look for in the question stem; the right is the answer.

I took the exam in Simplified Chinese, so this sheet pairs each answer with the Chinese term I'd see on the exam. **The Chinese column is intentionally kept in this English copy**, because the Chinese wording is the point of the sheet. Chinese terms come from Microsoft Learn Simplified Chinese pages (checked 2026-11-25). Markers:
- **HT**: human-translated page
- **MT**: machine-translated page (the exam's wording may differ)
- **?**: not found on Learn; a common rendering I wrote myself

One English word can have several Chinese renderings; for example, agent can be 智能体 or 代理. If the Chinese doesn't make sense, look at the English original or the product name.

## 0. Three things to remember first

1. **Client = the application, not the user.** Client ID and client secret both live on the App registration. (OAuth "client": 客户端)
2. **Copilot Studio telemetry in App Insights: always query customEvents.**
3. If the question asks for a **knowledge source** (知识来源), don't pick a tool (工具); if it asks about **one specific node**, look in that node's own properties.

## 1. Identity and authentication

| Cue in the stem | Answer | Chinese |
|---|---|---|
| Signed-in user + a middle tier calling further downstream **as the user**; the incoming token's audience is the middle tier | **On-Behalf-Of (OBO)** | 代理 (OBO) 流 (MT); audience = 受众 (MT) |
| **No user**, scheduled job, background service, application permissions | **Client credentials** | 客户端凭据流, 应用程序权限, 管理员同意 (?) |
| User signs in personally on a sign-in page | Authorization code | 授权代码流 (?) |
| Device without a keyboard | Device code | 设备代码流 (?) |
| AI Search: **store no keys, no app registration**, use the creator's own identity | **Entra ID Integrated** (the maker's identity, not the end user's) | Microsoft Entra ID 已集成 |
| AI Search: **must keep working after the maker leaves**, no shared key | **Service principal** | 服务主体（Microsoft Entra ID 应用程序） |
| AI Search: simplest, shared key | Access key | 访问密钥 |
| **Each user may only see content they have permission to** | Don't pick from the three AI Search auth types; look for a Copilot connector or user authentication | |
| Custom website + OBO | Authenticate manually + require users to sign in | 手动身份验证 (?) |
| Least privilege to call a Foundry agent | Foundry **Agent Consumer** role, scoped to the agent | |

## 2. Networking

| Cue in the stem | Answer | Chinese |
|---|---|---|
| Azure resource with **public access disabled**, reachable through a **private endpoint**; the stem mentions a Managed Environment | **VNet support** (subnet delegation) | 虚拟网络支持, Azure 子网委派, 专用终结点 (MT) |
| Data in an **on-premises data center** (on-premises SQL) | **On-premises data gateway** | 本地数据网关 (MT) |

## 3. Knowledge

| Cue in the stem | Answer | Chinese |
|---|---|---|
| **Semantic retrieval across article content** (ServiceNow knowledge articles), with user permissions checked at query time | **Unstructured data source** (ingested into Dataverse with a semantic index) | 非结构化数据 (MT) |
| Query **structured records in tables**, **data stays in the source system**, changes often | **Real-time knowledge** (Power Platform connector, user token) | 实时知识 (?) |
| Must be **searchable in Microsoft Search**, security-trimmed by ACL | **Copilot connector** | Copilot 连接器 (?) |
| Must **perform an action** (create / update) | **Connector action as a tool** | 工具 (MT) |
| The knowledge source doesn't understand users' words or internal terms | **Synonyms + glossary** on the knowledge source | 同义词, 术语表 (HT) |
| A tool isn't being called | Improve the tool's **name + description** | |

## 4. Topics and generative answers

| Cue in the stem | Answer | Chinese |
|---|---|---|
| Affects **only this one** generative answers node: format, audience, what to say when nothing is found | The node's **Data source configuration pane** → custom instructions | 生成式答案节点 / 生成式回复节点 (MT) |
| Affects the **whole agent's** tone | The agent's **Instructions** (Overview page) | |
| A separate prompt feature | Custom prompt editor (distractor) | |
| Different replies per channel | Condition on **ChannelId** | |

## 5. Multi-agent

| Cue in the stem | Answer | Chinese |
|---|---|---|
| A published Copilot Studio agent in the **same environment**, **reused in several places** | Add agent → **Copilot Studio** (connected agent) | 已连接代理 / 关联代理 (MT) |
| Used only inside the parent agent, not reused | **Child agent** | 子代理 / 子智能体 (MT) |
| An agent on a **non-Microsoft platform** | **A2A**: enter the `/a2a` **communication endpoint** (not the agent card); pick OAuth 2.0 to match the parameters the vendor gives | 通过 A2A 协议可用的其他代理 (MT) |
| Data in Fabric, natural language to SQL/DAX/KQL | Fabric data agent (must be published in Fabric first) | Fabric Data 代理 (MT) |

## 6. Testing and evaluation

| Cue in the stem | Answer | Chinese |
|---|---|---|
| **Quick, small**, generated from description and instructions | **Quick question set** | 快捷问题集 (HT) |
| **Specify the number of questions**, generated from knowledge or a file | **Full question set** | 完整的问题集 (HT) |
| **Reuse the session from the test pane** | **Use your test chat conversation** | 测试聊天 (HT) |
| Single-turn reply, compare its meaning against the expected answer | **Compare meaning** | 比较含义 (HT) |
| Overall score for a multi-turn (conversational) test | **General quality** (the compare graders can't be used; Keyword, Content safety and Custom can) | 整体质量 / 常规质量 (HT) |
| Failure class: **the expected answer itself is wrong** | Evaluation setup | |
| Failure class: **the source was never added** | Knowledge configuration | |
| Failure class: **the source is added, but the document is outdated or missing the content** | Knowledge content | |
| Failure class: **the information is right, but the instructions don't describe this behavior** | Prompt / instruction gap | |

For failure classification, ask four questions in order: is the exam paper right → was the book put on the shelf → is the book's content right → does the instruction manual say so.

## 7. Monitoring

| Cue in the stem | Answer | Chinese |
|---|---|---|
| Query agent events | **customEvents** table (not traces) | 自定义遥测事件 (HT) |
| Exclude test canvas events | `customDimensions['designMode'] == "False"` (a string) | 测试画布 (HT) |
| Teams only | **channelId** | |
| Computer use shows In progress, but that can't be trusted | Verify with **transcript mode** | |

## 8. ALM and governance

| Cue in the stem | Answer | Chinese |
|---|---|---|
| **Whose connection** (service account) differs per environment, without editing the flow | **Connection reference** | 连接引用 (MT) |
| **A value** (URL) differs per environment | **Environment variable** | 环境变量 (HT) |
| A sensitive value | **Secret** environment variable (stored in Key Vault) | 机密, Azure 密钥保管库 (HT) |
| A shared table **only gained one new column** | **Edit objects**, select only that column | 编辑对象 (MT) |
| Only the table's properties changed, no columns | **Include table metadata** | 包含表元数据 (MT) |
| Bring the whole table | Include all objects | 包含所有对象 (MT) |
| Put an agent into a solution and bring its dependencies | **Add required objects** (the connection itself is not carried over) | |
| Pipeline **source** | The **reviewed, ready-for-release** environment; in-progress development environments stay out of the pipeline | 源环境, 管道, 管道阶段 (MT) |
| Pipeline target environments | Managed Environment | 托管环境 (MT) |
| **Everyone in the organization** can find it in Teams | Show to everyone in my org + **submit for admin approval** | 对我组织中的所有人显示, 管理员批准 (MT) |
| Only **users it's already shared with**, no admin involved | Show to my teammates and shared users | 对我的团队成员和共享用户显示 (MT) |
| DLP: connector groups | Business / Non-business / Blocked; new connectors default to Non-business; **scope it to a specific environment** | 数据策略 (HT); 业务 / 非业务 / 已阻止 (?) |

## 9. Exam-room rules

- Flag questions you're unsure about and come back at the end; Microsoft Learn is available, but searching is slow, so use it only to confirm names.
- Yes/No series: judge each proposed solution against the **original goal in the stem**; once you finish one, you can't go back and change it.
- If you see new-version content such as skills, memory or Foundry IQ, don't panic if you get it wrong.
