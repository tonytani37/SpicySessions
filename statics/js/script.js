document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 要素の取得 ---
    const episodeListContainer = document.getElementById('episode-list');
    const listView = document.getElementById('list-view');
    const detailView = document.getElementById('detail-view');
    const detailTitle = document.getElementById('detail-title');
    const detailSubTile = document.getElementById('detail-subtitle'); // 注意: 元のIDが 'detail-subtitle' なら合わせる
    const detailOthers = document.getElementById('detail-others');
    // const detailLinkContainer = document.getElementById('detail-link');
    const sessionDetailsContainer = document.getElementById('session-details');
    const backButton = document.getElementById('back-button');
    // ソートボタン取得
    const sortAscButton = document.getElementById('sort-asc');
    const sortDescButton = document.getElementById('sort-desc');

    // 検索関連のDOM要素
    const searchInput = document.getElementById('search-input');
    const searchExecuteButton = document.getElementById('search-execute-button');
    const searchResultsView = document.getElementById('search-results-view');
    const searchResultsList = document.getElementById('search-results-list');
    const backToListFromSearchButton = document.getElementById('back-to-list-from-search');

    const scrollButton = document.getElementById('scroll-button'); // スクロールボタンも取得

    let fetchedData = []; // フェッチしたデータを保持する変数

    // --- 表示切替関数 ---
    function showListView() {
        listView.classList.remove('hidden');
        detailView.classList.add('hidden');
        searchResultsView.classList.add('hidden'); // 検索結果も隠す
        searchInput.value = ''; // 検索語をクリア
        window.scrollTo(0, 0); // ページトップへ
    }

    function showDetailView() {
        listView.classList.add('hidden');
        detailView.classList.remove('hidden');
        searchResultsView.classList.add('hidden'); // 検索結果を隠す
        window.scrollTo(0, 0); // ページトップへ
    }

    function showSearchResultsView() {
        listView.classList.add('hidden');
        detailView.classList.add('hidden');
        searchResultsView.classList.remove('hidden');
        window.scrollTo(0, 0); // ページトップへ
    }


    // --- データ表示関数 ---

    // 放送回一覧表示（既存の関数を少し修正）
    function displayListView(data) {
        episodeListContainer.innerHTML = ''; // クリア

        if (!data || !Array.isArray(data)) {
             console.error("無効なデータ形式です:", data);
             episodeListContainer.innerHTML = '<li>表示できるデータ形式ではありません。</li>';
             showListView(); // 表示状態をリストビューに設定
             return;
        }
        if (data.length === 0) {
             episodeListContainer.innerHTML = '<li>表示できるデータがありません。</li>';
             showListView(); // 表示状態をリストビューに設定
             return;
        }

        data.forEach((episode, index) => {
            const episodeNum = episode.hasOwnProperty('回') ? episode.回 : '不明';
            const broadcastDate = episode.hasOwnProperty('放送日') ? episode.放送日 : '不明';
            const title = episode.hasOwnProperty('放送タイトル') ? episode.放送タイトル : 'タイトル不明';

            const listItem = document.createElement('li');
            const infoSpan = document.createElement('span');
            const episodeNumStrong = document.createElement('strong');
            episodeNumStrong.textContent = `第${episodeNum}回`;
            infoSpan.appendChild(episodeNumStrong);
            infoSpan.appendChild(document.createTextNode(` (${broadcastDate})`));
            infoSpan.appendChild(document.createElement('br'));
            const titleSpan = document.createElement('span');
            titleSpan.textContent = title;
            titleSpan.classList.add('episode-title');
            infoSpan.appendChild(titleSpan);

            const detailLink = document.createElement('a');
            detailLink.textContent = '詳細を見る';
            detailLink.href = '#';
            // detailLink.dataset.index = index;
            
            // ✅ episode自体を渡す（クロージャで保持）
            detailLink.addEventListener('click', (event) => {
                event.preventDefault();
                displayDetailViewByEpisode(episode);
            });

            // detailLink.addEventListener('click', (event) => {
            //     event.preventDefault();
            //     const episodeIndex = event.target.dataset.index;
            //     displayDetailView(fetchedData, parseInt(episodeIndex, 10));
            // });

            listItem.appendChild(infoSpan);
            listItem.appendChild(detailLink);
            episodeListContainer.appendChild(listItem);
        });

        showListView(); // 表示状態をリストビューに設定
    }

    // 詳細表示（既存の関数を少し修正）
     function displayDetailView(data, index) {
        if (typeof index !== 'number' || index < 0 || index >= data.length) {
            console.error('無効なインデックス:', index);
            sessionDetailsContainer.innerHTML = '<p>詳細情報の表示中にエラーが発生しました (無効なインデックス)。</p>';
            showDetailView(); // 表示状態を詳細ビューに設定
            return;
        }

        const episode = data[index];
        if (!episode || typeof episode !== 'object') {
             console.error('無効なエピソードデータ:', episode);
             sessionDetailsContainer.innerHTML = '<p>詳細情報の表示中にエラーが発生しました (無効なデータ)。</p>';
             showDetailView(); // 表示状態を詳細ビューに設定
             return;
        }

        const episodeNum = episode.hasOwnProperty('回') ? episode.回 : '不明';
        const broadcastDate = episode.hasOwnProperty('放送日') ? episode.放送日 : '不明';
        const title = episode.hasOwnProperty('放送タイトル') ? episode.放送タイトル : 'タイトル不明';
        const curry = episode.hasOwnProperty('カレー') ? episode.カレー : '不明';
        const others = episode.hasOwnProperty('参考') ? episode.参考 : '不明';
        const times = episode.hasOwnProperty('放送時間') ? episode.放送時間 : '不明';
        const sessions = (episode.hasOwnProperty('セッション情報') && Array.isArray(episode.セッション情報)) ? episode.セッション情報 : [];

        detailTitle.textContent = `第${episodeNum}回: ${title}`;
        // 注意: IDが detail-subtitle ならこちら
        if (detailSubTile) detailSubTile.textContent = `●初回放送日時: ${broadcastDate} ${times}  ●提供カレー: ${curry}`;
        // detailOthers.textContent = `●参考情報: ${others}`;
        const referenceText = episode.hasOwnProperty('参考') ? episode.参考 : '';
        const linkHtml = (episode.hasOwnProperty('link') && episode.link.trim() !== '')
            ? `　<a href="${episode.link}" target="_blank" rel="noopener noreferrer">▶ 番組公式 </a>`
            : '';
        const spaceHtml = (episode.hasOwnProperty('space') && episode.space.trim() !== '')
            ? `　<a href="${episode.space}" target="_blank" rel="noopener noreferrer">▶ 非公式感想スペース </a>`
            : '';
        detailOthers.innerHTML = `●参考情報: ${linkHtml}${spaceHtml}${referenceText}`;

        sessionDetailsContainer.innerHTML = ''; // クリア

        if (sessions.length > 0) {
            sessions.forEach((session, sessionIndex) => {
                if (!session || typeof session !== 'object') return;

                const song = session.hasOwnProperty('セッション曲') ? session.セッション曲 : '曲名不明';
                const original = session.hasOwnProperty('オリジナル') ? session.オリジナル : '情報なし';
                const singers = session.hasOwnProperty('歌唱') ? session.歌唱 : '情報なし';
                const players = session.hasOwnProperty('演奏者') ? session.演奏者 : '情報なし';
                const remarks = session.hasOwnProperty('備考') ? session.備考 : null;

                const sessionDiv = document.createElement('div');
                sessionDiv.classList.add('session-item');

                const sessionTitle = document.createElement('h4');
                sessionTitle.textContent = `${song}`;
                sessionDiv.appendChild(sessionTitle);

                const createDetailParagraph = (label, value) => {
                    if (value === null || value === undefined || value === '') return null;
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
                const pRemarks = createDetailParagraph('備考', remarks);

                if(pOriginal) sessionDiv.appendChild(pOriginal);
                if(pSingers) sessionDiv.appendChild(pSingers);
                if(pPlayers) sessionDiv.appendChild(pPlayers);
                if(pRemarks) sessionDiv.appendChild(pRemarks);

                sessionDetailsContainer.appendChild(sessionDiv);
            });
        } else {
            sessionDetailsContainer.innerHTML = '<p>この放送回にはセッション情報がありません。</p>';
        }

        showDetailView(); // 表示状態を詳細ビューに設定
    }
function displaySearchResults(results) {
    searchResultsList.innerHTML = ''; // 結果リストをクリア

    if (!results || results.length === 0) {
        searchResultsList.innerHTML = '<li>指定された文字を含むセッション曲名は見つかりませんでした</li>';
        showSearchResultsView(); 
        return;
    }

    results.forEach(result => {
        const listItem = document.createElement('li');

        // タイトル＋ボタンを横並びにまとめるコンテナ
        const titleContainer = document.createElement('div');
        titleContainer.classList.add('result-title-container');

        // 放送タイトル（テキスト）
        const titleSpan = document.createElement('span');
        titleSpan.classList.add('result-title');
        titleSpan.textContent = result.放送タイトル;
        titleContainer.appendChild(titleSpan);

        // 「詳細を見る」ボタン
        const detailLink = document.createElement('a');
        detailLink.href = '#';
        detailLink.textContent = '詳細を見る';
        detailLink.classList.add('detail-link');

        detailLink.addEventListener('click', (event) => {
            event.preventDefault();
            const targetEpisode = fetchedData.find(
                ep => ep.放送タイトル === result.放送タイトル && ep.放送日 === result.放送日
            );
            if (targetEpisode) {
                displayDetailViewByEpisode(targetEpisode);
            } else {
                console.error("対象のエピソードが見つかりません:", result);
            }
        });

        titleContainer.appendChild(detailLink);
        listItem.appendChild(titleContainer);

        // 放送日
        const dateSpan = document.createElement('span');
        dateSpan.classList.add('result-date');
        dateSpan.textContent = `放送日: ${result.放送日}`;
        listItem.appendChild(dateSpan);

        // 該当セッション曲
        result.matchedSongs.forEach(song => {
            const songSpan = document.createElement('span');
            songSpan.classList.add('result-song');
            songSpan.textContent = song;
            listItem.appendChild(songSpan);
        });

        searchResultsList.appendChild(listItem);
    });

    showSearchResultsView(); 
}

    // --- 検索処理関数 (新規追加) ---
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase(); // 入力値を取得し、小文字に変換

        if (!searchTerm) {
            // 検索語が空の場合は何もしないか、メッセージを表示
            alert("１文字以上のセッション曲名を入力してください。");
            return;
        }

        // if (!searchTerm) {
        //     Swal.fire({
        //         icon: 'warning',
        //         title: '曲名が入力されてませんよ',
        //         text: '検索したい曲名を１文字以上入力してね',
        //     });
        //     return;
        // }

        const searchResults = []; // 検索結果を格納する配列

        fetchedData.forEach(episode => {
            // 各放送回のセッション情報をチェック
            if (episode.セッション情報 && Array.isArray(episode.セッション情報)) {
                const matchedSongsInEpisode = []; // この放送回でマッチした曲を格納

                episode.セッション情報.forEach(session => {
                    // セッション曲が存在し、検索語を含むかチェック
                    if (session.セッション曲 && typeof session.セッション曲 === 'string' &&
                        session.セッション曲.toLowerCase().includes(searchTerm)) {
                        // マッチした曲名をリストに追加
                        matchedSongsInEpisode.push(session.セッション曲);
                    }
                });

                // この放送回で1曲以上マッチした場合、結果に追加
                if (matchedSongsInEpisode.length > 0) {
                    searchResults.push({
                        放送日: episode.放送日 || '不明',
                        放送タイトル: episode.放送タイトル || 'タイトル不明',
                        matchedSongs: matchedSongsInEpisode // マッチした曲のリスト
                    });
                }
            }
        });

        // 検索結果を表示
        displaySearchResults(searchResults);
    }


    // --- イベントリスナー ---

    // 詳細画面の戻るボタン
    backButton.addEventListener('click', () => {
        displayListView(fetchedData); // 全件リスト表示に戻る
    });

    // 検索実行ボタン
    searchExecuteButton.addEventListener('click', () => {
        performSearch();
    });
    // 検索入力欄でEnterキーを押した場合も検索実行
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });


    // 検索結果画面の戻るボタン
    backToListFromSearchButton.addEventListener('click', () => {
        displayListView(fetchedData); // 全件リスト表示に戻る
    });

    // スクロールボタン（既存の処理）
    scrollButton.addEventListener('click', function () {
        if (window.scrollY < 100) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    window.addEventListener('scroll', function () {
        scrollButton.textContent = (window.scrollY < 100) ? '最後へ' : '先頭へ';
    });

    // ソート処理
    function sortEpisodes(order = 'asc') {
        const sortedData = [...fetchedData].sort((a, b) => {
            const aNum = Number(a.回);
            const bNum = Number(b.回);
            return order === 'asc' ? aNum - bNum : bNum - aNum;
        });
        displayListView(sortedData);
    }

    function displayDetailViewByEpisode(episode) {
        const index = fetchedData.findIndex(item => item.回 === episode.回);
        if (index !== -1) {
            displayDetailView(fetchedData, index);
        } else {
            console.error("エピソードが見つかりません:", episode);
        }
    }

// イベントリスナー追加
sortAscButton.addEventListener('click', () => sortEpisodes('asc'));
sortDescButton.addEventListener('click', () => sortEpisodes('desc'));

    // --- データ取得処理 (既存の処理) ---
    const jsonUrl = 'json/spicy_sessions_songs.json'; // ローカル用パス
    // const jsonUrl = 'json/old/spicy_sessions_songs.json'; // ローカル用パス
    // const jsonUrl = 'https://raw.githubusercontent.com/tonytani37/nogizaka46_live/refs/heads/main/spicy_sessions_songs.json';

   fetch(jsonUrl)
    .then(response => response.json())
    .then(parsedData => {
        fetchedData = parsedData;
        // 初期表示は一覧
        displayListView(fetchedData);
    })
    .catch(error => {
        console.error('データの読み込みまたは処理に失敗しました:', error);
        episodeListContainer.innerHTML = `<li>データの読み込みに失敗しました: ${error.message}</li>`;
        showListView(); // エラー時もリストビューを表示
    });

// microcmsから取得した内容を画面へ反映させる
    const { createClient } = microcms;

    const client = createClient({
      serviceDomain: 'info-oshirase', // service-domain は https://XXXX.microcms.io の XXXX 部分
      apiKey: 'uvmCNlFCsI2uzLJ4QwKvp8Rf0Nldi2CfTnej',
    })
    const newsListContainer = document.querySelector('#news-list');
    // エンドポイント名のみを指定し、全記事（または複数記事）を取得
    client.get({ endpoint: 'categories'}) // ★ ID（gppino0sel）を削除してエンドポイント名のみにする
    .then((res) => {
    // console.log("API応答データ全体:", res);
        // 記事の配列 (res.contents) が存在するか確認
        if (!res.contents || res.contents.length === 0) {
            newsListContainer.innerHTML = "<p>現在、お知らせはありません。</p>";
            return;
        }
        const limit = 1; // 表示したい記事の最大件数
        const limitedContents = res.contents.slice(0, limit); // 先頭から3件を切り出す
        // console.log(limitedContents)
        // 記事の配列をループ処理
        // res.contents.forEach(item => {
        limitedContents.forEach(item => {
            // 日付を整形
            const formattedDate = new Date(item.publishedAt).toLocaleDateString('ja-JP');

            // 表示するHTML要素を組み立てる
            const articleHtml = `
                <div class="news-item" style="border-bottom: 1px solid #ccc; padding: 10px 0;">
                    <p style="font-size: small; color: gray;"> ${item.name} (${formattedDate})</p>
                </div>
            `;

            // 記事コンテナに追加
            newsListContainer.innerHTML += articleHtml;
        });
    })
        .catch((err) => {
        console.error("コンテンツの取得に失敗しました:", err);
        document.body.innerHTML = "<h1>お知らせの取得中にエラーが発生しました。</h1>";
    });
    // microcmsの処理はここまで

}); // DOMContentLoaded の終わり

// 注意：元のコードに2つのDOMContentLoadedリスナーがありましたが、1つにまとめました。
// スクロールボタンの処理も同じリスナー内に移動しました。