import type { PageInfo, Message, MessageResponse } from '@/types';

/**
 * Content script for extracting page information
 */
class PageContentExtractor {
  /**
   * Extract page information
   */
  extract(): PageInfo {
    return {
      title: this.getTitle(),
      url: window.location.href,
      description: this.getDescription(),
      content: this.getMainContent(),
      thumbnail: this.getThumbnail()
    };
  }

  /**
   * Get page title
   */
  private getTitle(): string {
    // Priority: <title>, og:title, first <h1>, or 'Untitled'
    return (
      document.title ||
      this.getMeta('og:title') ||
      document.querySelector('h1')?.textContent?.trim() ||
      'Untitled'
    );
  }

  /**
   * Get page description
   */
  private getDescription(): string {
    return (
      this.getMeta('description') ||
      this.getMeta('og:description') ||
      this.getMeta('twitter:description') ||
      ''
    );
  }

  /**
   * Get main content from page
   */
  private getMainContent(): string {
    // Priority: <article>, <main>, <body>
    const contentElement =
      document.querySelector('article') ||
      document.querySelector('main') ||
      document.querySelector('[role="main"]') ||
      document.body;

    if (!contentElement) {
      return '';
    }

    // Clone element to avoid modifying the actual page
    const clone = contentElement.cloneNode(true) as HTMLElement;

    // Remove unwanted elements
    clone.querySelectorAll('script, style, nav, header, footer, iframe, noscript').forEach(el => {
      el.remove();
    });

    // Extract text content
    const text = clone.textContent || '';

    // Clean up whitespace and return first 1000 characters
    return text.replace(/\s+/g, ' ').trim().substring(0, 1000);
  }

  /**
   * Get page thumbnail/cover image
   */
  private getThumbnail(): string {
    // 辅助函数：安全地解析URL
    const safeParseUrl = (urlString: string, baseUrl?: string): string => {
      if (!urlString || typeof urlString !== 'string') return '';
      
      try {
        // 移除可能的空白字符
        urlString = urlString.trim();
        if (!urlString) return '';
        
        // 如果是相对URL，使用baseUrl或当前页面URL
        const absoluteUrl = new URL(urlString, baseUrl || window.location.href);
        
        // 验证协议（只接受http/https）
        if (absoluteUrl.protocol !== 'http:' && absoluteUrl.protocol !== 'https:') {
          console.warn('[ContentScript] Invalid image protocol:', absoluteUrl.protocol);
          return '';
        }
        
        return absoluteUrl.href;
      } catch (e) {
        console.warn('[ContentScript] Failed to parse URL:', urlString, e);
        return '';
      }
    };

    // 1. 尝试获取 Open Graph image
    try {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage instanceof HTMLMetaElement && ogImage.content) {
        const url = safeParseUrl(ogImage.content);
        if (url) {
          console.log('[ContentScript] Found og:image:', url);
          return url;
        }
      }
    } catch (e) {
      console.error('[ContentScript] Error reading og:image:', e);
    }

    // 2. 尝试获取 Twitter image
    try {
      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (twitterImage instanceof HTMLMetaElement && twitterImage.content) {
        const url = safeParseUrl(twitterImage.content);
        if (url) {
          console.log('[ContentScript] Found twitter:image:', url);
          return url;
        }
      }
    } catch (e) {
      console.error('[ContentScript] Error reading twitter:image:', e);
    }

    // 3. 尝试在页面中查找最大的图片
    try {
      // 优先搜索主内容区，如果找不到再搜索整个页面
      const searchAreas = [
        document.querySelector('main'),
        document.querySelector('[role="main"]'),
        document.querySelector('article'),
        document.body
      ].filter(Boolean) as HTMLElement[];

      for (const area of searchAreas) {
        if (!area) continue;

        const images = area.querySelectorAll('img');
        let largestImage: HTMLImageElement | null = null;
        let maxArea = 0;

        for (const img of images) {
          try {
            // 跳过没有src的图片
            if (!img.src) continue;

            // 跳过data URL和blob URL（通常是临时图片）
            if (img.src.startsWith('data:') || img.src.startsWith('blob:')) continue;

            // 获取图片尺寸
            let width = img.naturalWidth;
            let height = img.naturalHeight;

            // 如果图片还没加载完成，尝试使用其他方式获取尺寸
            if (width === 0 || height === 0) {
              // 方法1: 检查HTML属性
              const attrWidth = img.getAttribute('width');
              const attrHeight = img.getAttribute('height');
              
              if (attrWidth && attrHeight) {
                const parsedWidth = parseInt(attrWidth);
                const parsedHeight = parseInt(attrHeight);
                if (!isNaN(parsedWidth) && !isNaN(parsedHeight)) {
                  width = parsedWidth;
                  height = parsedHeight;
                }
              }
              
              // 方法2: 使用CSS计算尺寸
              if (width === 0 || height === 0) {
                width = img.width || img.offsetWidth || img.clientWidth;
                height = img.height || img.offsetHeight || img.clientHeight;
              }
            }

            // 过滤掉太小的图片（可能是图标、按钮、广告等）
            // 同时过滤掉异常大的图片（可能是背景图）
            if (width > 200 && height > 200 && width < 5000 && height < 5000) {
              const area = width * height;
              if (area > maxArea) {
                maxArea = area;
                largestImage = img;
              }
            }
          } catch (imgError) {
            // 单个图片处理失败不影响其他图片
            console.warn('[ContentScript] Error processing image:', imgError);
            continue;
          }
        }

        // 如果在当前区域找到了合适的图片，验证并返回
        if (largestImage && largestImage.src) {
          const url = safeParseUrl(largestImage.src);
          if (url) {
            console.log('[ContentScript] Found largest image:', url, `(${Math.round(Math.sqrt(maxArea))}px)`);
            return url;
          }
        }
      }
    } catch (e) {
      console.error('[ContentScript] Error finding largest image:', e);
    }

    // 4. 如果都没找到，返回空字符串
    console.log('[ContentScript] No suitable thumbnail found');
    return '';
  }

  /**
   * Get meta tag content
   */
  private getMeta(name: string): string {
    const meta =
      document.querySelector(`meta[name="${name}"]`) ||
      document.querySelector(`meta[property="${name}"]`);

    return meta?.getAttribute('content') || '';
  }
}

// Create extractor instance
const extractor = new PageContentExtractor();

// 防止重复注入
if ((window as any).__AITMARKS_CONTENT_SCRIPT_LOADED__) {
  console.log('[ContentScript] Already loaded, skipping initialization');
} else {
  (window as any).__AITMARKS_CONTENT_SCRIPT_LOADED__ = true;

  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener(
    (
      message: Message,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: MessageResponse) => void
    ) => {
      console.log('[ContentScript] Received message:', message.type);

      // 心跳响应 - 用于检测 content script 是否存活（优先处理，最快响应）
      if (message.type === 'PING') {
        try {
          sendResponse({ success: true, data: 'pong' });
        } catch (error) {
          console.error('[ContentScript] Failed to send PING response:', error);
        }
        return true;
      }

      // 提取页面信息
      if (message.type === 'EXTRACT_PAGE_INFO') {
        // 使用异步处理，避免阻塞
        (async () => {
          try {
            console.log('[ContentScript] Starting page info extraction...');
            
            // 检查文档是否准备就绪
            if (document.readyState === 'loading') {
              console.log('[ContentScript] Document still loading, waiting...');
              await new Promise(resolve => {
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', resolve, { once: true });
                } else {
                  resolve(null);
                }
              });
            }

            const pageInfo = extractor.extract();
            
            // 验证提取的数据
            if (!pageInfo.url) {
              console.warn('[ContentScript] Extracted page info missing URL');
              pageInfo.url = window.location.href;
            }
            if (!pageInfo.title) {
              console.warn('[ContentScript] Extracted page info missing title');
              pageInfo.title = document.title || 'Untitled';
            }

            console.log('[ContentScript] Successfully extracted page info:', {
              title: pageInfo.title,
              url: pageInfo.url,
              hasDescription: !!pageInfo.description,
              hasThumbnail: !!pageInfo.thumbnail,
              contentLength: pageInfo.content?.length || 0
            });

            sendResponse({
              success: true,
              data: pageInfo
            });
          } catch (error) {
            console.error('[ContentScript] Failed to extract page info:', error);
            
            // 即使失败也返回基本信息
            sendResponse({
              success: true,
              data: {
                title: document.title || 'Untitled',
                url: window.location.href,
                description: '',
                content: '',
                thumbnail: ''
              }
            });
          }
        })();
        
        return true; // Keep message channel open for async response
      }

      // 未知消息类型
      console.warn('[ContentScript] Unknown message type:', message.type);
      return false;
    }
  );

  console.log('[AITmarks] Content script loaded successfully');
}
