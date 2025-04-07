document.addEventListener('DOMContentLoaded', () => {
    const episodeListContainer = document.getElementById('episode-list');
    const listView = document.getElementById('list-view');
    const detailView = document.getElementById('detail-view');
    const detailTitle = document.getElementById('detail-title');
    const sessionDetailsContainer = document.getElementById('session-details');
    const backButton = document.getElementById('back-button');

    let fetchedData = []; // フェッチしたデータを保持する変数

    function displayListView(data) {
        episodeListContainer.innerHTML = ''; // "読み込み中..." をクリア

        if (!data || !Array.isArray(data)) { // データが配列であるかもチェック
             console.error("無効なデータ形式です:", data);
             episodeListContainer.innerHTML = '<li>表示できるデータ形式ではありません。</li>';
             return;
        }
        if (data.length === 0) {
             episodeListContainer.innerHTML = '<li>表示できるデータがありません。</li>';
             return;
        }


        data.forEach((episode, index) => {
            // JSONデータのキーが存在するかチェックする
            const episodeNum = episode.hasOwnProperty('回') ? episode.回 : '不明';
            const broadcastDate = episode.hasOwnProperty('放送日') ? episode.放送日 : '不明';
            const title = episode.hasOwnProperty('放送タイトル') ? episode.放送タイトル : 'タイトル不明';

            const listItem = document.createElement('li');
            const infoSpan = document.createElement('span');
            // 安全なテキスト挿入 (innerHTMLより安全)
            // 回 (太字)
            const episodeNumStrong = document.createElement('strong');
            episodeNumStrong.textContent = `第${episodeNum}回`;
            infoSpan.appendChild(episodeNumStrong);

            // 放送日 (通常テキスト)
            infoSpan.appendChild(document.createTextNode(` (${broadcastDate})`));

            // 改行
            infoSpan.appendChild(document.createElement('br'));

            // タイトル (spanで囲み、クラスを追加)
            const titleSpan = document.createElement('span'); // span要素を作成
            titleSpan.textContent = title;                    // テキストを設定
            titleSpan.classList.add('episode-title');       // CSSクラス 'episode-title' を追加 ★
            infoSpan.appendChild(titleSpan);                  // infoSpanに追加


            const detailLink = document.createElement('a');
            detailLink.textContent = '詳細を見る';
            detailLink.href = '#';
            detailLink.dataset.index = index; // インデックスを保持

            detailLink.addEventListener('click', (event) => {
                event.preventDefault();
                const episodeIndex = event.target.dataset.index;
                // fetchedData を displayDetailView に渡す
                displayDetailView(fetchedData, parseInt(episodeIndex, 10));
            });

            listItem.appendChild(infoSpan);
            listItem.appendChild(detailLink);
            episodeListContainer.appendChild(listItem);
        });

        listView.classList.remove('hidden');
        detailView.classList.add('hidden');
    }

     function displayDetailView(data, index) {
        if (typeof index !== 'number' || index < 0 || index >= data.length) {
            console.error('無効なインデックス:', index);
            sessionDetailsContainer.innerHTML = '<p>詳細情報の表示中にエラーが発生しました (無効なインデックス)。</p>';
            listView.classList.add('hidden');
            detailView.classList.remove('hidden');
            window.scrollTo(0, 0);
            return;
        }

        const episode = data[index];
        if (!episode || typeof episode !== 'object') {
             console.error('無効なエピソードデータ:', episode);
             sessionDetailsContainer.innerHTML = '<p>詳細情報の表示中にエラーが発生しました (無効なデータ)。</p>';
             listView.classList.add('hidden');
             detailView.classList.remove('hidden');
             window.scrollTo(0, 0);
             return;
        }

        // JSONデータのキーが存在するかチェック
        const episodeNum = episode.hasOwnProperty('回') ? episode.回 : '不明';
        const broadcastDate = episode.hasOwnProperty('放送日') ? episode.放送日 : '不明';
        const title = episode.hasOwnProperty('放送タイトル') ? episode.放送タイトル : 'タイトル不明';
        const sessions = (episode.hasOwnProperty('セッション情報') && Array.isArray(episode.セッション情報)) ? episode.セッション情報 : [];


        detailTitle.textContent = `第${episodeNum}回: ${title} (${broadcastDate})`;
        sessionDetailsContainer.innerHTML = ''; // クリア

        if (sessions.length > 0) {
            sessions.forEach((session, sessionIndex) => {
                if (!session || typeof session !== 'object') return; // セッションデータが無効ならスキップ

                // 各セッション情報のキーが存在するかチェック
                const song = session.hasOwnProperty('セッション曲') ? session.セッション曲 : '曲名不明';
                const original = session.hasOwnProperty('オリジナル') ? session.オリジナル : '情報なし';
                const singers = session.hasOwnProperty('歌唱') ? session.歌唱 : '情報なし';
                const players = session.hasOwnProperty('演奏者') ? session.演奏者 : '情報なし';
                const remarks = session.hasOwnProperty('備考') ? session.備考 : null; // なければnull


                const sessionDiv = document.createElement('div');
                sessionDiv.classList.add('session-item');

                const sessionTitle = document.createElement('h4');
                 // 安全なテキスト挿入
                // sessionTitle.textContent = `セッション ${sessionIndex + 1}: ${song}`;
                sessionTitle.textContent = `${song}`;
                sessionDiv.appendChild(sessionTitle);

                // innerHTMLを使わずに要素を生成して追加 (より安全)
                const createDetailParagraph = (label, value) => {
                    if (value === null || value === undefined || value === '') return null; // 値がない場合は要素を生成しない
                    const p = document.createElement('p');
                    const strong = document.createElement('strong');
                    strong.textContent = `${label}: `;
                    p.appendChild(strong);
                    p.appendChild(document.createTextNode(value));
                    return p;
                };

                const pOriginal = createDetailParagraph('オリジナル', original);
                const pSingers = createDetailParagraph('歌唱', singers);
                const pPlayers = createDetailParagraph('演奏者', players);
                const pRemarks = createDetailParagraph('備考', remarks); // remarksがnullや空文字ならnullが返る

                if(pOriginal) sessionDiv.appendChild(pOriginal);
                if(pSingers) sessionDiv.appendChild(pSingers);
                if(pPlayers) sessionDiv.appendChild(pPlayers);
                if(pRemarks) sessionDiv.appendChild(pRemarks); // nullでない場合のみ追加

                sessionDetailsContainer.appendChild(sessionDiv);
            });
        } else {
            sessionDetailsContainer.innerHTML = '<p>この放送回にはセッション情報がありません。</p>';
        }

        listView.classList.add('hidden');
        detailView.classList.remove('hidden');
        window.scrollTo(0, 0);
    }


    // 戻るボタンのイベントリスナー
    backButton.addEventListener('click', () => {
        displayListView(fetchedData);
    });

    // --- 外部ファイルからデータ取得処理 ---
    const jsonUrl = 'https://raw.githubusercontent.com/tonytani37/nogizaka46_live/refs/heads/main/spicy_sessions_songs.json';

    fetch(jsonUrl)
        .then(response => {
            if (!response.ok) {
                // エラーレスポンスの詳細を含める
                throw new Error(`ファイル読み込みエラー: ${response.status} ${response.statusText}`);
            }
            return response.json(); // JSON解析 (Promiseを返す)
        })
        .then(parsedData => { // ここで解析されたデータ (parsedData) を受け取る
            // データを変数に保存
            fetchedData = parsedData;

            // 保存したデータでリスト表示関数を呼び出す
            displayListView(fetchedData);

            // もし renderTable 関数が必要なら、ここで呼び出す
            // renderTable(fetchedData);
        })
        .catch(error => {
            // fetch や .then の処理中にエラーが発生した場合
            console.error('データの読み込みまたは処理に失敗しました:', error);
            // ユーザーにエラーメッセージを表示
            episodeListContainer.innerHTML = `<li>データの読み込みに失敗しました: ${error.message}</li>`;
            // ビューの状態を適切に設定
            listView.classList.remove('hidden');
            detailView.classList.add('hidden');
        });
});
