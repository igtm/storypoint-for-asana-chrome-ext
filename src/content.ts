const _slicedToArray = (() => {
  function sliceIterator(arr, i) {
    const _arr = [];
    let _n = true;
    let _d = false;
    let _e = undefined;
    try {
      for (
        let _i = arr[Symbol.iterator](), _s;
        !(_n = (_s = _i.next()).done);
        _n = true
      ) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i.return();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  return (arr, i) => {
    if (Array.isArray(arr)) {
      return arr;
    }
    if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    }
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  };
})();

const SP_BADGES = ["?", "0", "0.5", "1", "2", "3", "5", "8", "13", "21"];
const badgeStyle = {
  background: "#3498db",
  borderRadius: "12px",
  minWidth: "12px",
  height: "12px",
  padding: "5px",
  color: "#fff",
  textAlign: "center",
  fontWeight: "600",
  marginLeft: "4px",
  cursor: "pointer",
  fontSize: "11px",
  lineHeight: "11px",
};
const countStyle = {
  padding: "0 5px",
  color: "#000",
  opacity: "0.7",
  "text-align": "center",
  "font-weight": "600",
  "margin-left": "4px",
  "font-size": "18px",
};

const clearBadgeColor = "#95a5a6";
const syncSubtaskBadgeColor = "#1abc9c";
const completedBadgeColor = "#f39c12";

// Board
// バッジの表示 (カード表示時)
setInterval(() => {
  // 操作するエレメント
  const bodyContainerPromise = getElementUntilRendered(
    document,
    ".TaskPaneFields",
    100
  );
  const titleTextAreaPromise = getElementUntilRendered(
    document,
    ".SimpleTextarea--dynamic",
    100
  );

  // 操作するエレメントがすべて取得できたら (カード表示時)
  Promise.all([bodyContainerPromise, titleTextAreaPromise])
    .then((_ref) => {
      const _ref2 = _slicedToArray(_ref, 2);
      const bodyContainer = _ref2[0];
      const titleTextArea = _ref2[1];

      // 既にバッジが表示されているか
      const hasBadgeContainer =
        document.getElementsByClassName("badge-container").length !== 0;
      if (hasBadgeContainer) {
        return;
      }

      // バッジの生成
      const badgeElements = SP_BADGES.map((e) => {
        const badgeElement = document.createElement("span");
        badgeElement.textContent = e;
        Object.keys(badgeStyle).forEach((key) => {
          badgeElement.style[key] = badgeStyle[key];
        });
        badgeElement.addEventListener(
          "click",
          (e) => {
            titleTextArea.focus();
            titleTextArea.value = `(${
              e.target.textContent
            }) ${titleTextArea.value.replace(/^\(.+\) /, "")}`;
            const evt = document.createEvent("KeyboardEvent");
            evt.initEvent("input", true, false);
            // adding this created a magic and passes it as if keypressed
            titleTextArea.dispatchEvent(evt);
            titleTextArea.blur();
          },
          false
        );
        return badgeElement;
      });
      // クリアバッジの生成
      const clearBadge = (() => {
        const badgeElement = document.createElement("span");
        badgeElement.textContent = "clear";
        Object.keys(badgeStyle).forEach((key) => {
          badgeElement.style[key] = badgeStyle[key];
        });
        badgeElement.style.background = clearBadgeColor;

        badgeElement.addEventListener(
          "click",
          (e) => {
            titleTextArea.focus();
            titleTextArea.value = titleTextArea.value
              .replace(/^\(.+\) /, "")
              .replace(/ \[.+\]/, "");
            const evt = document.createEvent("KeyboardEvent");
            evt.initEvent("input", true, false);
            // adding this created a magic and passes it as if keypressed
            titleTextArea.dispatchEvent(evt);
            titleTextArea.blur();
          },
          false
        );
        return badgeElement;
      })();
      badgeElements.unshift(clearBadge);
      // サブタスク更新バッジの生成 (ボタンを押すとサブタスクにセットしたSPを計算しこのタスクのSPにセットする)
      const syncSubtaskBadge = (() => {
        const badgeElement = document.createElement("span");
        badgeElement.textContent = "sync subtasks";
        Object.keys(badgeStyle).forEach((key) => {
          badgeElement.style[key] = badgeStyle[key];
        });
        badgeElement.style.background = syncSubtaskBadgeColor;

        badgeElement.addEventListener(
          "click",
          (e) => {
            // サブタスクのSPを集計
            const subtasks = document.querySelectorAll(
              ".TaskList > .DropTargetRow"
            );
            let subtasksNotCompletedStoryPoint = 0;
            let subtasksCompletedStoryPoint = 0;
            Array.prototype.forEach.call(subtasks, (e) => {
              const isCompleted = !!e.querySelector(
                ".TaskRowCompletionStatus-checkbox--complete"
              );
              const subtaskTitleElement = e.querySelector(
                ".AutogrowTextarea-shadow"
              );
              if (subtaskTitleElement) {
                const sp_matched =
                  subtaskTitleElement.textContent.match(/^\((\d+(?:\.\d+)?)\)/);
                if (sp_matched) {
                  if (isCompleted) {
                    subtasksCompletedStoryPoint += Number(sp_matched[1]);
                  }
                  subtasksNotCompletedStoryPoint += Number(sp_matched[1]);
                }
              }
            });
            const titlePrefix = (() => {
              if (subtasksNotCompletedStoryPoint) {
                return `(${subtasksNotCompletedStoryPoint}) `;
              }
              return "";
            })();
            const titlePostfix = (() => {
              if (subtasksCompletedStoryPoint) {
                return ` [${subtasksCompletedStoryPoint}]`;
              }
              return "";
            })();

            // 編集
            titleTextArea.focus();
            titleTextArea.value =
              titlePrefix +
              titleTextArea.value
                .replace(/^\(.+\) /, "")
                .replace(/ \[.+\]/, "") +
              titlePostfix;
            const evt = document.createEvent("KeyboardEvent");
            evt.initEvent("input", true, false);
            // adding this created a magic and passes it as if keypressed
            titleTextArea.dispatchEvent(evt);
            titleTextArea.blur();
          },
          false
        );
        return badgeElement;
      })();
      badgeElements.push(syncSubtaskBadge);

      // バッジコンテナの生成
      const badgeContainer = document.createElement("div");
      badgeContainer.style.display = "flex";
      badgeContainer.style.margin = "2px 10px";
      badgeContainer.className = "badge-container LabeledRowStructure-right";

      // バッジコンテナにバッジの挿入
      badgeElements.forEach((e) => {
        badgeContainer.appendChild(e);
      });

      // バッジコンテナをDOMに設置
      // fixed 20.01.19  2 column style
      const fieldContainer = document.createElement("div");
      fieldContainer.className = "LabeledRowStructure";
      const rightColumn = (() => {
        const labelContainer = document.createElement("div");
        labelContainer.style.width = "100px";
        labelContainer.className = "LabeledRowStructure-left";
        const label = document.createElement("label");
        label.className = "LabeledRowStructure-label";
        label.textContent = "Story Point";
        labelContainer.appendChild(label);
        return labelContainer;
      })();
      fieldContainer.appendChild(rightColumn);
      fieldContainer.appendChild(badgeContainer);

      // descriptionの上に追加
      const fields = bodyContainer.children;
      bodyContainer.insertBefore(fieldContainer, fields[fields.length - 1]);
    })
    .catch((e) => {});
}, 1000);

// ボード上カード列別のポイント合計を上部に表示
setInterval(() => {
  // 操作するエレメント
  const boardColumnsPromise = getElementsUntilRendered(
    document,
    ".BoardColumn",
    100
  );

  // 操作するエレメントがすべて取得できたら (カード表示時)
  boardColumnsPromise
    .then((boardColumns) => {
      let totalNotCompletedStoryPoint = 0;
      let totalCompletedStoryPoint = 0;

      // 各カラム別集計
      boardColumns.forEach((boardColumn) => {
        // 操作するエレメント
        const boardColumnHeader =
          boardColumn.querySelector(".BoardColumnHeader");
        const boardCardNames = boardColumn.querySelectorAll(
          ".BoardCard-taskName"
        );

        // SPの計算
        let columnTotalNotCompletedStoryPoint = 0;
        let columnTotalCompletedStoryPoint = 0;
        Array.prototype.forEach.call(boardCardNames, (e) => {
          const isCompleted =
            e.parentElement.parentElement.getElementsByClassName(
              "TaskRowCompletionStatus-taskCompletionIcon--complete"
            ).length !== 0;
          const sp_matched = e.textContent.match(/^\((\d+(?:\.\d+)?)\)/); // SP   例: (10) タスク => 10
          const sp_subtask_completed_matched =
            e.textContent.match(/\[(\d+(?:\.\d+)?)\]$/); // 部分完了タスクSP   例: (10) タスク [5]  => 5/5
          if (sp_matched) {
            if (isCompleted) {
              columnTotalCompletedStoryPoint += Number(sp_matched[1]);
            } else {
              if (sp_subtask_completed_matched) {
                // サブタスクの完了SPがある
                columnTotalNotCompletedStoryPoint +=
                  Number(sp_matched[1]) -
                  Number(sp_subtask_completed_matched[1]);
                columnTotalCompletedStoryPoint += Number(
                  sp_subtask_completed_matched[1]
                );
              } else {
                columnTotalNotCompletedStoryPoint += Number(sp_matched[1]);
              }
            }
          }
        });
        totalNotCompletedStoryPoint += columnTotalNotCompletedStoryPoint;
        totalCompletedStoryPoint += columnTotalCompletedStoryPoint;

        // 件数
        {
          const hasTotalCountElement = boardColumn.querySelector(
            ".columntop-count-story-point"
          );
          if (hasTotalCountElement) {
            hasTotalCountElement.textContent = displayNumber(
              boardCardNames.length
            );
          } else {
            // 上部に表示する合計バッジを生成
            const totalStoryPointElement = document.createElement("span");
            totalStoryPointElement.className = "columntop-count-story-point";
            totalStoryPointElement.textContent = displayNumber(
              boardCardNames.length
            );
            Object.keys(countStyle).forEach((key) => {
              totalStoryPointElement.style[key] = countStyle[key];
            });

            boardColumnHeader.appendChild(totalStoryPointElement);
          }
        }
        // 未終了StoryPoint
        {
          const hasTotalStoryPointElement = boardColumn.querySelector(
            ".columntop-notcompleted-story-point"
          );
          if (hasTotalStoryPointElement) {
            hasTotalStoryPointElement.textContent = displayNumber(
              columnTotalNotCompletedStoryPoint
            );
          } else {
            // 上部に表示する合計バッジを生成
            const _totalStoryPointElement = document.createElement("span");
            _totalStoryPointElement.className =
              "columntop-notcompleted-story-point";
            _totalStoryPointElement.textContent = displayNumber(
              columnTotalNotCompletedStoryPoint
            );
            Object.keys(badgeStyle).forEach((key) => {
              _totalStoryPointElement.style[key] = badgeStyle[key];
            });

            boardColumnHeader.appendChild(_totalStoryPointElement);
          }
        }
        // 終了StoryPoint (こちらは1ポイント以上あるときのみ表示)
        {
          const _hasTotalStoryPointElement = boardColumn.querySelector(
            ".columntop-completed-story-point"
          );
          if (_hasTotalStoryPointElement) {
            // 0件なら表示しない
            if (columnTotalCompletedStoryPoint === 0) {
              _hasTotalStoryPointElement.parentNode.removeChild(
                _hasTotalStoryPointElement
              );
              return;
            }

            _hasTotalStoryPointElement.textContent = displayNumber(
              columnTotalCompletedStoryPoint
            );
          } else {
            // 0件なら表示しない
            if (columnTotalCompletedStoryPoint === 0) {
              return;
            }

            // 上部に表示する合計バッジを生成
            const _totalStoryPointElement2 = document.createElement("span");
            _totalStoryPointElement2.className =
              "columntop-completed-story-point";
            _totalStoryPointElement2.textContent = displayNumber(
              columnTotalCompletedStoryPoint
            );
            Object.keys(badgeStyle).forEach((key) => {
              _totalStoryPointElement2.style[key] = badgeStyle[key];
            });
            _totalStoryPointElement2.style.background = completedBadgeColor;

            boardColumnHeader.appendChild(_totalStoryPointElement2);
          }
        }
      });

      // ボード内合計 (ボード上部のプロジェクト名 右横に表示)
      const boardTitleContainer = document.querySelector(
        ".TopbarPageHeaderStructure-titleRow"
      );
      if (!boardTitleContainer) return;
      const hasTotalStoryPointElement = document.querySelector(
        ".boardtop-notcompleted-story-point"
      );
      if (hasTotalStoryPointElement) {
        hasTotalStoryPointElement.textContent = displayNumber(
          totalNotCompletedStoryPoint
        );
      } else {
        // 0件なら表示しない
        if (totalNotCompletedStoryPoint === 0) {
          return;
        }
        // 合計未完了SPバッジを表示
        const totalStoryPointElement = document.createElement("span");
        totalStoryPointElement.className = "boardtop-notcompleted-story-point";
        totalStoryPointElement.textContent = displayNumber(
          totalNotCompletedStoryPoint
        );
        Object.keys(badgeStyle).forEach(function (key) {
          totalStoryPointElement.style[key] = badgeStyle[key];
        });
        boardTitleContainer.appendChild(totalStoryPointElement);
      }
      const _hasTotalStoryPointElement2 = document.querySelector(
        ".boardtop-completed-story-point"
      );
      if (_hasTotalStoryPointElement2) {
        // 0件なら表示しない
        if (totalCompletedStoryPoint === 0) {
          _hasTotalStoryPointElement2.parentNode.removeChild(
            _hasTotalStoryPointElement2
          );
          return;
        }

        _hasTotalStoryPointElement2.textContent = displayNumber(
          totalCompletedStoryPoint
        );
      } else {
        // 0件なら表示しない
        if (totalCompletedStoryPoint === 0) {
          return;
        }
        const _totalStoryPointElement3 = document.createElement("span");
        _totalStoryPointElement3.className = "boardtop-completed-story-point";
        _totalStoryPointElement3.textContent = displayNumber(
          totalCompletedStoryPoint
        );
        Object.keys(badgeStyle).forEach((key) => {
          _totalStoryPointElement3.style[key] = badgeStyle[key];
        });
        _totalStoryPointElement3.style.background = completedBadgeColor;
        boardTitleContainer.appendChild(_totalStoryPointElement3);
      }
    })
    .catch((e) => {});
}, 1000);

// List & Mytask
// セクション合計を右横に表示
setInterval(() => {
  // 操作するエレメント
  const listSectionsPromise = getElementsUntilRendered(
    document,
    ".DropTargetTaskGroupHeader",
    100
  );

  // 操作するエレメントがすべて取得できたら (カード表示時)
  listSectionsPromise
    .then((listSections) => {
      let totalNotCompletedStoryPoint = 0;
      let totalCompletedStoryPoint = 0;

      // 各カラム別集計
      listSections.forEach((listSection) => {
        // 操作するエレメント
        const listSectionHeader = listSection.querySelector(
          ".TaskGroupHeader-headerContainer"
        );
        const listSectionDropTargetRow = listSection.parentElement;

        // SPの計算
        let columnTotalNotCompletedStoryPoint = 0;
        let columnTotalCompletedStoryPoint = 0;

        // 手続き的ループ: 次の ListSectionに辿り着くまで１つずつ進む
        let cnt = 0;

        // List
        let nextRow = listSectionDropTargetRow.querySelector(
          ".DropTargetRow.ProjectSpreadsheetGridRow-dropTargetRow"
        );
        // MyTask
        if (nextRow === null) {
          nextRow = listSectionDropTargetRow.querySelector(
            ".MyTasksSpreadsheetGridRow-dropTargetRow"
          );
        }

        while (
          cnt < 1000 &&
          nextRow &&
          nextRow.querySelector(".SpreadsheetTaskName-input")
        ) {
          const titleElement = nextRow.querySelector(
            ".SpreadsheetTaskName-input"
          );
          const title = titleElement.textContent;
          const isCompleted =
            nextRow.getElementsByClassName(
              "TaskRowCompletionStatus-taskCompletionIcon--complete"
            ).length !== 0;
          const sp_matched = title.match(/^\((\d+(?:\.\d+)?)\)/); // SP   例: (10) タスク => 10
          const sp_subtask_completed_matched =
            title.match(/\[(\d+(?:\.\d+)?)\]$/); // 部分完了タスクSP   例: (10) タスク [5]  => 5/5
          if (sp_matched) {
            if (isCompleted) {
              columnTotalCompletedStoryPoint += Number(sp_matched[1]);
            } else {
              if (sp_subtask_completed_matched) {
                // サブタスクの完了SPがある
                columnTotalNotCompletedStoryPoint +=
                  Number(sp_matched[1]) -
                  Number(sp_subtask_completed_matched[1]);
                columnTotalCompletedStoryPoint += Number(
                  sp_subtask_completed_matched[1]
                );
              } else {
                columnTotalNotCompletedStoryPoint += Number(sp_matched[1]);
              }
            }
          }
          nextRow = nextRow.nextElementSibling;
          ++cnt;
        }
        totalNotCompletedStoryPoint += columnTotalNotCompletedStoryPoint;
        totalCompletedStoryPoint += columnTotalCompletedStoryPoint;

        // 未終了StoryPoint
        {
          const hasTotalStoryPointElement = listSection.querySelector(
            ".columntop-notcompleted-story-point"
          );
          if (hasTotalStoryPointElement) {
            hasTotalStoryPointElement.textContent = displayNumber(
              columnTotalNotCompletedStoryPoint
            );
          } else {
            // 上部に表示する合計バッジを生成
            const totalStoryPointElement = document.createElement("span");
            totalStoryPointElement.className =
              "columntop-notcompleted-story-point";
            totalStoryPointElement.textContent = displayNumber(
              columnTotalNotCompletedStoryPoint
            );
            Object.keys(badgeStyle).forEach((key) => {
              totalStoryPointElement.style[key] = badgeStyle[key];
            });

            // 右端に追加
            listSectionHeader.appendChild(totalStoryPointElement);
            // タイトルの左隣に追加
            //const t = listSectionHeader.querySelector('.SectionRow-sectionName')
            //listSectionHeader.insertBefore(totalStoryPointElement, t)
          }
        }
        // 終了StoryPoint (こちらは1ポイント以上あるときのみ表示)
        {
          const _hasTotalStoryPointElement3 = listSection.querySelector(
            ".columntop-completed-story-point"
          );
          if (_hasTotalStoryPointElement3) {
            // 0件なら表示しない
            if (columnTotalCompletedStoryPoint === 0) {
              _hasTotalStoryPointElement3.parentNode.removeChild(
                _hasTotalStoryPointElement3
              );
              return;
            }

            _hasTotalStoryPointElement3.textContent = displayNumber(
              columnTotalCompletedStoryPoint
            );
          } else {
            // 0件なら表示しない
            if (columnTotalCompletedStoryPoint === 0) {
              return;
            }

            // 上部に表示する合計バッジを生成
            const _totalStoryPointElement4 = document.createElement("span");
            _totalStoryPointElement4.className =
              "columntop-completed-story-point";
            _totalStoryPointElement4.textContent = displayNumber(
              columnTotalCompletedStoryPoint
            );
            Object.keys(badgeStyle).forEach((key) => {
              _totalStoryPointElement4.style[key] = badgeStyle[key];
            });
            _totalStoryPointElement4.style.background = completedBadgeColor;

            listSectionHeader.appendChild(_totalStoryPointElement4);
          }
        }
      });

      // ボード内合計 (ボード上部のプロジェクト名 右横に表示)
      const boardTitleContainer = document.querySelector(
        ".TopbarPageHeaderStructure-titleRow"
      );
      if (!boardTitleContainer) return;
      {
        const hasTotalStoryPointElement = document.querySelector(
          ".boardtop-notcompleted-story-point"
        );
        if (hasTotalStoryPointElement) {
          hasTotalStoryPointElement.textContent = displayNumber(
            totalNotCompletedStoryPoint
          );
        } else {
          // 0件なら表示しない
          if (totalNotCompletedStoryPoint === 0) {
            return;
          }
          // 合計未完了SPバッジを表示
          const totalStoryPointElement = document.createElement("span");
          totalStoryPointElement.className =
            "boardtop-notcompleted-story-point";
          totalStoryPointElement.textContent = displayNumber(
            totalNotCompletedStoryPoint
          );
          Object.keys(badgeStyle).forEach((key) => {
            totalStoryPointElement.style[key] = badgeStyle[key];
          });
          boardTitleContainer.appendChild(totalStoryPointElement);
        }
      }
      // 合計完了SPバッジを表示
      {
        const _hasTotalStoryPointElement4 = document.querySelector(
          ".boardtop-completed-story-point"
        );
        if (_hasTotalStoryPointElement4) {
          // 0件なら表示しない
          if (totalCompletedStoryPoint === 0) {
            _hasTotalStoryPointElement4.parentNode.removeChild(
              _hasTotalStoryPointElement4
            );
            return;
          }

          _hasTotalStoryPointElement4.textContent = displayNumber(
            totalCompletedStoryPoint
          );
        } else {
          // 0件なら表示しない
          if (totalCompletedStoryPoint === 0) {
            return;
          }
          const _totalStoryPointElement5 = document.createElement("span");
          _totalStoryPointElement5.className = "boardtop-completed-story-point";
          _totalStoryPointElement5.textContent = displayNumber(
            totalCompletedStoryPoint
          );
          Object.keys(badgeStyle).forEach((key) => {
            _totalStoryPointElement5.style[key] = badgeStyle[key];
          });
          _totalStoryPointElement5.style.background = completedBadgeColor;
          boardTitleContainer.appendChild(_totalStoryPointElement5);
        }
      }
    })
    .catch((e) => {});
}, 1000);

/**
 * 要素が取得できるまでループする関数 (max500ms)
 * @param {*} query
 * @param {*} wait ms
 */
function getElementUntilRendered(parent, query, wait) {
  return new Promise((resolve, reject) => {
    function iter(counter) {
      if (counter * wait >= 500) {
        return reject();
      }
      const e = parent.querySelector(query);
      if (e) {
        return resolve(e);
      }
      return setTimeout(iter.bind(this, counter + 1), wait);
    }
    iter(0);
  });
}

/**
 * 要素が取得できるまでループする関数 (max500ms)
 * @param {*} query
 * @param {*} wait ms
 */
function getElementsUntilRendered(parent, query, wait) {
  return new Promise((resolve, reject) => {
    function iter(counter) {
      if (counter * wait >= 500) {
        return reject();
      }
      const e = parent.querySelectorAll(query);
      if (e.length > 0) {
        return resolve(e);
      }
      return setTimeout(iter.bind(this, counter + 1), wait);
    }
    iter(0);
  });
}

function displayNumber(number) {
  return Number.parseFloat(number.toFixed(2));
}
