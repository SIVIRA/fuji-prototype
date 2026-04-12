# Fuji Prototype

AI サービスのモック・プロトタイプを構築・管理するプラットフォーム。
利用ユーザは Claude Desktop（Claude Code）を使い、チャットで指示するだけでモックを作成・デプロイできる。

## セットアップ担当向け: 初期構築手順

### 1. リポジトリのセットアップ

```bash
git clone https://github.com/sivira/fuji-prototype.git
cd fuji-prototype
npm install
cp .env.example .env
```

`.env` を開き、以下の API キーを設定する:

```
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENAI_API_KEY=sk-xxxxx
```

**Anthropic API キーの取得:**
1. https://console.anthropic.com/ にアクセス
2. アカウントを作成またはログイン
3. 左メニューの「API Keys」をクリック
4. 「Create Key」をクリック
5. Name に `fuji-prototype` と入力
6. 「Create Key」をクリック
7. 表示されたキー（`sk-ant-` で始まる文字列）をコピー

**OpenAI API キーの取得:**
1. https://platform.openai.com/ にアクセス
2. アカウントを作成またはログイン
3. 左メニューの「API keys」をクリック
4. 「Create new secret key」をクリック
5. Name に `fuji-prototype` と入力
6. 「Create secret key」をクリック
7. 表示されたキー（`sk-` で始まる文字列）をコピー

### 2. Vercel の設定

1. https://vercel.com/ にアクセスし、GitHub アカウントでログイン
2. 「Add New...」→「Project」をクリック
3. `sivira/fuji-prototype` リポジトリを選択し「Import」
4. Framework Preset が「Next.js」になっていることを確認
5. 「Environment Variables」セクションを開く
6. 以下の環境変数を追加:
   - Key: `ANTHROPIC_API_KEY` / Value: `.env` と同じ値
   - Key: `OPENAI_API_KEY` / Value: `.env` と同じ値
7. 「Deploy」をクリック

以降、main ブランチに push されると自動でデプロイされる。

### 3. 利用ユーザのマシンセットアップ

以下の手順を利用ユーザのマシンで実行する（セットアップ担当が代行する）。

#### 3.1 Homebrew のインストール

ターミナルを開き、以下を実行:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

インストール完了後、表示される `Next steps` の指示に従って PATH を設定する。

#### 3.2 Node.js のインストール

```bash
brew install node
```

確認:

```bash
node -v
```

バージョン番号が表示されれば OK。

#### 3.3 GitHub CLI のインストールと認証

```bash
brew install gh
```

GitHub にログイン:

```bash
gh auth login
```

対話形式で以下を選択:
- `? What account do you want to log into?` → **GitHub.com**
- `? What is your preferred protocol for Git operations on this host?` → **HTTPS**
- `? Authenticate Git with your GitHub credentials?` → **Yes**
- `? How would you like to authenticate GitHub CLI?` → **Login with a web browser**
- ブラウザが開くので、GitHub アカウントでログインして認証を完了する

#### 3.4 リポジトリの clone

```bash
cd ~/Documents
gh repo clone sivira/fuji-prototype
cd fuji-prototype
npm install
```

#### 3.5 環境変数の設定

```bash
cp .env.example .env
```

`.env` を開き、API キーを入力する（セットアップ担当が入力する）。

#### 3.6 Claude Desktop のインストール

1. https://claude.ai/download にアクセス
2. macOS 版をダウンロードしてインストール
3. Claude アプリを起動し、Anthropic アカウントでログイン（Claude Pro / Max / Team の契約が必要）
4. 画面上部中央の「Code」タブをクリックして Claude Code が利用できることを確認

#### 3.7 Claude Code プラグインのインストール

Claude Desktop の Code タブを開いた状態で、チャット入力欄に以下を入力して実行:

**superpowers プラグイン:**

```
/install-plugin superpowers@claude-plugins-official
```

**frontend-design プラグイン:**

```
/install-plugin frontend-design@claude-plugins-official
```

それぞれ確認プロンプトが表示されたら承認する。

#### 3.8 動作確認

Claude Desktop の Code タブで以下の手順でプロジェクトを開く:

1. 「Local」を選択
2. 「Select folder」をクリックし、`~/Documents/fuji-prototype` を選択
3. **「ワークツリー」のチェックは外す**（オフにする）
チャットで以下のように入力して、dev サーバーが起動しブラウザで確認できれば完了:

```
ローカルサーバーを起動して
```

## 利用ユーザ向け: 使い方

Claude Desktop を開き、プロジェクトを選択したら、チャットで指示するだけ。

**モックを作る例:**

```
「カスタマーサポート向けのチャットボットのモックを作って。
左側にチャット一覧、右側にチャット画面があるレイアウトで。」
```

```
「この PDF の仕様書に基づいて、ダッシュボード画面のモックを作って。」
```

**モックを修正する例:**

```
「chat-bot のモックで、送信ボタンの色を緑に変えて」
```

**デプロイする例:**

```
「今の変更を反映して（push して）」
```
