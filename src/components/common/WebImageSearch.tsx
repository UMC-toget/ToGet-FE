import { useEffect, useRef, useState } from "react";
import ChevronLeftIcon from "../icons/ChevronLeftIcon";
import SearchIcon from "../icons/SearchIcon";
import CloseIcon from "../icons/CloseIcon";
import MoreVerticalIcon from "../icons/MoreVerticalIcon";
import { searchWebImages } from "../../api/webImages";
import type { WebImageResult } from "../../api/webImages";

const RECENT_SEARCH_KEY = "toget:webImageSearchRecent";
const RECENT_SEARCH_MAX = 10;

function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCH_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(list: string[]) {
  try {
    localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(list));
  } catch {
    // 저장 공간 초과 등은 무시 — 최근 검색어는 부가 기능이라 실패해도 검색 자체엔 영향 없음
  }
}

interface WebImageSearchProps {
  onCancel: () => void;
  onSelect: (file: File) => void;
}

/**
 * 사진 업로드 바텀시트의 "웹 사진 검색" 흐름. 검색어 입력(+최근 검색어) → 결과 그리드에서
 * 이미지를 바로 클릭하거나 더보기(⋮)로 "이미지 사용하기"/"사이트 방문하기"를 선택합니다.
 */
export default function WebImageSearch({
  onCancel,
  onSelect,
}: WebImageSearchProps) {
  const [view, setView] = useState<"search" | "results">("search");
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    loadRecentSearches(),
  );
  const [results, setResults] = useState<WebImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const activeMenuRef = useRef<HTMLDivElement | null>(null);

  // 더보기(⋮) 메뉴가 열려 있을 때, 메뉴/토글 버튼이 아닌 다른 영역을 누르면 닫습니다.
  useEffect(() => {
    if (openMenuIndex === null) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (activeMenuRef.current && !activeMenuRef.current.contains(e.target as Node)) {
        setOpenMenuIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuIndex]);

  // 최근 검색어 한 줄 스크롤: 모바일은 네이티브 스와이프로 이미 되고, 데스크톱은 마우스
  // 드래그로도 스크롤할 수 있게 보조합니다. 드래그 중이었다면 클릭(검색어 선택)은 무시합니다.
  const recentDragStart = useRef<{ x: number; scrollLeft: number } | null>(null);
  const recentDragMoved = useRef(false);

  const handleRecentPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    recentDragStart.current = { x: e.clientX, scrollLeft: e.currentTarget.scrollLeft };
    recentDragMoved.current = false;
  };

  const handleRecentPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = recentDragStart.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) > 4) recentDragMoved.current = true;
    if (recentDragMoved.current) e.currentTarget.scrollLeft = start.scrollLeft - dx;
  };

  const handleRecentPointerUp = () => {
    recentDragStart.current = null;
  };

  const handleRecentClickCapture = (e: React.MouseEvent) => {
    if (recentDragMoved.current) {
      e.preventDefault();
      e.stopPropagation();
      recentDragMoved.current = false;
    }
  };

  const runSearch = async (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setSubmittedQuery(trimmed);
    setView("results");
    setOpenMenuIndex(null);
    setLoading(true);
    setRecentSearches((prev) => {
      const next = [
        trimmed,
        ...prev.filter((keyword) => keyword !== trimmed),
      ].slice(0, RECENT_SEARCH_MAX);
      saveRecentSearches(next);
      return next;
    });
    try {
      const result = await searchWebImages(trimmed);
      setResults(result.images);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRecent = (keyword: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter((k) => k !== keyword);
      saveRecentSearches(next);
      return next;
    });
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    saveRecentSearches([]);
  };

  // 원본 이미지를 내려받아 File로 만들어 기존 onSelect(file) 흐름(업로드 등)에 그대로 태웁니다.
  const handleUseImage = async (image: WebImageResult) => {
    if (applying) return;
    setApplying(true);
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "web-image.jpg", {
        type: blob.type || "image/jpeg",
      });
      onSelect(file);
    } catch (e) {
      console.error("웹 이미지 적용 실패", e);
    } finally {
      setApplying(false);
    }
  };

  const handleBack = () => {
    if (view === "results") {
      setView("search");
      setOpenMenuIndex(null);
    } else {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-white">
      <div className="flex w-full max-w-[402px] flex-col">
        <header className="flex h-[50px] shrink-0 items-center gap-3 px-[18px]">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={handleBack}
            className="shrink-0 text-black"
          >
            <ChevronLeftIcon className="size-6" />
          </button>
          <div className="flex h-[42px] flex-1 items-center justify-between rounded-lg bg-background px-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch(query)}
              placeholder="상품 이름을 검색해보세요"
              className="w-full bg-transparent text-b1-r text-black placeholder:text-gray-400 focus:outline-none"
              autoFocus
            />
            <button
              type="button"
              aria-label="검색"
              onClick={() => runSearch(query)}
              className="shrink-0 text-black"
            >
              <SearchIcon className="size-6" />
            </button>
          </div>
        </header>

        {view === "search" ? (
          <div className="flex flex-1 flex-col px-[18px] pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-b1-m font-semibold text-black">
                최근 검색어
              </h2>
              {recentSearches.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearRecent}
                  className="text-caption1-m text-gray-600"
                >
                  전체 삭제
                </button>
              )}
            </div>
            {recentSearches.length > 0 ? (
              <div
                className="no-scrollbar mt-4 flex gap-2 overflow-x-auto"
                onPointerDown={handleRecentPointerDown}
                onPointerMove={handleRecentPointerMove}
                onPointerUp={handleRecentPointerUp}
                onPointerLeave={handleRecentPointerUp}
                onClickCapture={handleRecentClickCapture}
              >
                {recentSearches.map((keyword) => (
                  <div
                    key={keyword}
                    className="flex shrink-0 items-center gap-0.5 rounded-full border border-gray-300 py-2 pl-4 pr-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => runSearch(keyword)}
                      className="text-b2-m text-black"
                    >
                      {keyword}
                    </button>
                    <button
                      type="button"
                      aria-label={`${keyword} 삭제`}
                      onClick={() => handleRemoveRecent(keyword)}
                      className="flex size-5 items-center justify-center text-gray-500"
                    >
                      <CloseIcon className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 pb-20">
                <SearchIcon className="size-12 text-gray-300" />
                <p className="text-b1-r text-gray-500">최근 검색어가 없어요</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-[18px] pb-8 pt-4">
            {loading ? (
              <p className="py-20 text-center text-b2-r text-gray-500">
                검색 중이에요...
              </p>
            ) : results.length > 0 ? (
              <div className="columns-2 gap-4 [&>*]:mb-3 [&>*]:break-inside-avoid">
                {results.map((image, index) => (
                  <div
                    key={image.imageUrl}
                    className="relative"
                    ref={index === openMenuIndex ? activeMenuRef : undefined}
                  >
                    <button
                      type="button"
                      onClick={() => handleUseImage(image)}
                      disabled={applying}
                      className="block w-full overflow-hidden rounded-2xl border border-gray-200"
                    >
                      <img
                        src={image.thumbnailUrl}
                        alt=""
                        className="w-full object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      aria-label="더보기"
                      onClick={() =>
                        setOpenMenuIndex(openMenuIndex === index ? null : index)
                      }
                      className="ml-auto mt-1 flex size-5 items-center justify-center text-gray-600"
                    >
                      <MoreVerticalIcon className="size-5" />
                    </button>

                    {openMenuIndex === index && (
                      <div className="absolute right-0 top-[calc(100%+4px)] z-10 w-[100px] overflow-hidden rounded-lg bg-white py-1 shadow-[0_0_5px_rgba(0,0,0,0.2)]">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuIndex(null);
                            handleUseImage(image);
                          }}
                          className="block w-full px-3 py-1.5 text-left text-caption2-r text-black"
                        >
                          이미지 사용하기
                        </button>
                        <div className="mx-2 border-b-[0.6px] border-gray-200" />
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuIndex(null);
                            window.open(
                              image.sourceUrl,
                              "_blank",
                              "noopener,noreferrer",
                            );
                          }}
                          className="block w-full px-3 py-1.5 text-left text-caption2-r text-gray-600"
                        >
                          사이트 방문하기
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-20 text-center text-b2-r text-gray-500">
                '{submittedQuery}'에 대한 검색 결과가 없어요
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
