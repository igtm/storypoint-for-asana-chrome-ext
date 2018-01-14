'use strict';

// 定数
const SP_BADGES = ['?','0','0.5','1','2','3','5','8','13','21']
const badgeStyle = {
    background: '#3498db',
    borderRadius: '12px',
    minWidth: '14px',
    height: '16px',
    padding: '5px',
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginLeft: '4px',
    cursor: 'pointer'
}

const clearBadgeColor = '#95a5a6';
const completedBadgeColor = '#f39c12';


// Board
// バッジの表示 (カード表示時)
setInterval(() => {
    // 操作するエレメント
    const bodyContainerPromise = getElementUntilRendered(document,'.SingleTaskPane-body', 100)
    const descriptionContainerPromise = getElementUntilRendered(document,'.SingleTaskPane-descriptionRow', 100)
    const titleTextAreaPromise = getElementUntilRendered(document,'.simpleTextarea--dynamic', 100)
    
    // 操作するエレメントがすべて取得できたら (カード表示時)
    Promise.all([bodyContainerPromise, descriptionContainerPromise, titleTextAreaPromise])
        .then(([bodyContainer, descriptionContainer, titleTextArea]) => {
            // 既にバッジが表示されているか
            const hasBadgeContainer = document.getElementsByClassName('badge-container').length !== 0
            if(hasBadgeContainer){
                return ;
            }

            // バッジの生成
            const badgeElements = SP_BADGES.map(e => {
                const badgeElement = document.createElement('span')
                badgeElement.textContent = e
                Object.keys(badgeStyle).forEach(key => {
                    badgeElement.style[key] = badgeStyle[key]
                })
                badgeElement.addEventListener('click', function(e){
                    titleTextArea.focus()
                    titleTextArea.value = '(' + e.target.textContent + ') ' + titleTextArea.value.replace(/^\(.+\) /, '')
                    var evt = document.createEvent('KeyboardEvent');
                    evt.initEvent('input', true, false);
                    // adding this created a magic and passes it as if keypressed
                    titleTextArea.dispatchEvent(evt);
                    titleTextArea.blur()
                }, false)
                return badgeElement
            })
            // クリアバッジの生成
            const clearBadge = (()=>{
                const badgeElement = document.createElement('span')
                badgeElement.textContent = 'clear'
                Object.keys(badgeStyle).forEach(key => {
                    badgeElement.style[key] = badgeStyle[key]
                })
                badgeElement.style.background = clearBadgeColor

                badgeElement.addEventListener('click', function(e){
                    titleTextArea.focus()
                    titleTextArea.value = titleTextArea.value.replace(/^\(.+\) /, '')
                    var evt = document.createEvent('KeyboardEvent');
                    evt.initEvent('input', true, false);
                    // adding this created a magic and passes it as if keypressed
                    titleTextArea.dispatchEvent(evt);
                    titleTextArea.blur()
                }, false)
                return badgeElement
            })()
            badgeElements.unshift(clearBadge);
            
    
            // バッジコンテナの生成
            let badgeContainer = document.createElement('div')
            badgeContainer.style.display = 'flex'
            badgeContainer.className = 'badge-container'
    
            // バッジコンテナにバッジの挿入
            badgeElements.forEach(e => {
                badgeContainer.appendChild(e)
            })
    
            // バッジコンテナをDOMに設置
            bodyContainer.insertBefore(badgeContainer, descriptionContainer)
        })    
}, 1000)

// ボード上カード列別のポイント合計を上部に表示
setInterval(() => {
    // 操作するエレメント
    const boardColumnsPromise = getElementsUntilRendered(document, '.BoardColumn', 100)
    
    // 操作するエレメントがすべて取得できたら (カード表示時)
    boardColumnsPromise
        .then(boardColumns => {
            boardColumns.forEach(boardColumn => {

                // 操作するエレメント
                const boardColumnHeader = boardColumn.querySelector('.BoardColumnHeader')
                const boardCardNames = boardColumn.querySelectorAll('.BoardCard-name')

                // SPの計算
                let totalNotCompletedStoryPoint = 0, totalCompletedStoryPoint = 0;
                Array.prototype.forEach.call(boardCardNames, (e) => {
                    const isCompleted = e.getElementsByTagName('svg').length !== 0;
                    const sp_matched = e.textContent.match(/^\((\d+(?:\.\d+)?)\)/)
                    if(sp_matched){
                        if(isCompleted) {
                            totalCompletedStoryPoint += Number(sp_matched[1])
                        } else {
                            totalNotCompletedStoryPoint += Number(sp_matched[1])
                        }
                    }
                })

                // 未終了StoryPoint
                {
                    const hasTotalStoryPointElement = boardColumn.querySelector('.columntop-notcompleted-story-point')
                    if(hasTotalStoryPointElement){
                        hasTotalStoryPointElement.textContent = totalNotCompletedStoryPoint
                    } else {
                        // 上部に表示する合計バッジを生成
                        let totalStoryPointElement = document.createElement('span')
                        totalStoryPointElement.className = 'columntop-notcompleted-story-point'
                        totalStoryPointElement.textContent = totalNotCompletedStoryPoint
                        Object.keys(badgeStyle).forEach(key => {
                            totalStoryPointElement.style[key] = badgeStyle[key]
                        })

                        boardColumnHeader.appendChild(totalStoryPointElement)
                    }
                }
                // 終了StoryPoint (こちらは1ポイント以上あるときのみ表示)
                {
                    const hasTotalStoryPointElement = boardColumn.querySelector('.columntop-completed-story-point')
                    if(hasTotalStoryPointElement){
                        // 0件なら表示しない
                        if(totalCompletedStoryPoint === 0){
                            hasTotalStoryPointElement.parentNode.removeChild(hasTotalStoryPointElement)
                            return 
                        }

                        hasTotalStoryPointElement.textContent = totalCompletedStoryPoint
                    } else {
                        // 0件なら表示しない
                        if(totalCompletedStoryPoint === 0){
                            return 
                        }

                        // 上部に表示する合計バッジを生成
                        let totalStoryPointElement = document.createElement('span')
                        totalStoryPointElement.className = 'columntop-completed-story-point'
                        totalStoryPointElement.textContent = totalCompletedStoryPoint
                        Object.keys(badgeStyle).forEach(key => {
                            totalStoryPointElement.style[key] = badgeStyle[key]
                        })
                        totalStoryPointElement.style.background = completedBadgeColor

                        boardColumnHeader.appendChild(totalStoryPointElement)
                    }
                }
            })
        })

}, 1000)

/**
 * 要素が取得できるまでループする関数 (max5秒)
 * @param {*} query 
 * @param {*} wait ms
 */
function getElementUntilRendered(parent, query, wait) {
    return new Promise ((resolve, reject) => {
        function iter(counter) {
            if(counter*wait >= 5000) {
                return ;
            }
            const e = parent.querySelector(query)
            if(e) {
                return resolve(e)
            } else {
                return setTimeout(iter.bind(this, counter+1), wait)
            }
        }
        iter(0)
    })
}

/**
 * 要素が取得できるまでループする関数 (max5秒)
 * @param {*} query 
 * @param {*} wait ms
 */
function getElementsUntilRendered(parent, query, wait) {
    return new Promise ((resolve, reject) => {
        function iter(counter) {
            if(counter*wait >= 5000) {
                return ;
            }
            const e = parent.querySelectorAll(query)
            if(e) {
                return resolve(e)
            } else {
                return setTimeout(iter.bind(this, counter+1), wait)
            }
        }
        iter(0)
    })
}