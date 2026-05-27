// ==========================================================================
// 플로우캣 웹 인터페이스 통합 제어 스크립트 (최적화 버전)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    
// --- [0] 상수 및 데이터 분리 (하드코딩 제거) ---
    const CONFIG = {
        FADE_DURATION: 250, 
        TAB_SERVICE_FLOW: 'tab-service-flow',
        MODE_LIGHT: 'light',
        MODE_DARK: 'dark'
    };

    // 💡 추가: 전역 외부 링크 중앙 관리 객체
    const SITE_URLS = {
        demo: 'https://demo.flowkat.dev/ko/auth/signin', // 데모 링크가 확정되면 여기에만 적으면 됩니다 (예: 'https://demo.flowkat.dev')
        edu: 'https://edu.flowkat.dev',
        g2b: 'https://digitalmall.g2b.go.kr/link/GDSF001_01/?ctrtItemMngNo=R26TA01405587000000001',
        brochure: 'images/flowkat_brochure.pdf'
    };

    // 💡 추가: HTML의 data-link 속성을 찾아 href 자동 주입
    document.querySelectorAll('a[data-link]').forEach(anchor => {
        const linkKey = anchor.getAttribute('data-link');
        if (SITE_URLS[linkKey]) {
            anchor.href = SITE_URLS[linkKey];
        }
    });
    const REVIEWS = [
        { badge: '담당자 A', text: '저렴한 비용으로 다수의 서비스를 관제하고, OS 상태까지 한 번에 모니터링할 수 있어 매우 편리합니다.' },
        { badge: '담당자 B', text: '기관 분리 시 URL 기준 모니터링 덕분에 누락된 서비스를 쉽고 빠르게 파악할 수 있었습니다.' },
        { badge: '개발자 A', text: '직관적인 대시보드와 세밀한 담당자별 권한 설정 기능을 가장 유용하게 사용 중입니다.' },
        { badge: '개발자 B', text: '지연되던 악성 쿼리를 튜닝해 서비스 속도를 개선했고, 고객 만족도 조사에서도 호평을 받았습니다.' },
        { badge: '개발자 C', text: '크롤링 패턴을 실시간으로 감지하고 차트에 즉각 노출해 주는 기능 덕분에 장애에 신속히 대응했습니다.' },
        { badge: '운영자 A', text: '학사정보시스템의 공통코드 이슈를 추적하여, 참조 뷰 불일치 문제를 플로우캣과 함께 빠르게 해결했습니다.' }
    ];

    // --- [1] 고객 후기 동적 렌더링 ---
    const testimonialGrid = document.getElementById('testimonial-grid');
    if (testimonialGrid) {
        const reviewHTML = REVIEWS.map(review => `
            <div class="review-card">
                <span class="card-badge">${review.badge}</span>
                <p class="card-body">${review.text}</p>
            </div>
        `).join('');
        testimonialGrid.innerHTML = reviewHTML;
    }

    // --- [2] 조달청 검색창 클릭 시 상세 상품명세 드롭다운 토글 ---
    const searchTriggerBox = document.querySelector('.portal-search-trigger-box');
    if (searchTriggerBox) {
        searchTriggerBox.addEventListener('click', (e) => {
            if (e.target.closest('.portal-search-dropdown')) return;
            searchTriggerBox.classList.toggle('active');
        });
    }

    // --- [3] 블랙 버튼 그룹 제어 엔진 (모바일 아코디언 및 PC 화면 교체) ---
    const blackCards = document.querySelectorAll('.btn-variant-card.mod-black');
    const mainDashboardScreen = document.getElementById('feature-main-screen');
    
    // 반복적인 DOM 탐색을 막기 위한 상태 변수 (캐싱)
    let currentActiveBlackCard = document.querySelector('.btn-variant-card.mod-black.active'); 

    function updateMainImage(newSrc, currentCard) {
        if (!newSrc) return;
        
        // PC 메인 디스플레이 화면 전환 (정규식을 활용해 쿼리 파라미터 제외 순수 파일명 추출)
        if (mainDashboardScreen) {
            const getFileName = (url) => url.split('/').pop().split('#')[0].split('?')[0];
            const currentFileName = getFileName(mainDashboardScreen.src);
            const newFileName = getFileName(newSrc);
            
            if (currentFileName !== newFileName) {
                mainDashboardScreen.style.opacity = '0';
                
                // 시간 하드코딩(setTimeout) 대신 CSS transitionend 이벤트 활용
                const onTransitionEnd = () => {
                    mainDashboardScreen.src = newSrc;
                    mainDashboardScreen.style.opacity = '1';
                    mainDashboardScreen.removeEventListener('transitionend', onTransitionEnd);
                };
                
                mainDashboardScreen.addEventListener('transitionend', onTransitionEnd);

                // 안전장치(Fallback): 트랜지션 이벤트가 모종의 이유로 씹힐 경우를 대비
                setTimeout(() => {
                    if (mainDashboardScreen.style.opacity === '0') {
                        mainDashboardScreen.src = newSrc;
                        mainDashboardScreen.style.opacity = '1';
                        mainDashboardScreen.removeEventListener('transitionend', onTransitionEnd);
                    }
                }, CONFIG.FADE_DURATION + 50);
            }
        }

        // 클릭된 블랙 버튼 하위의 모바일 이미지 박스 소스 동기화
        if (currentCard) {
            const siblingBox = currentCard.nextElementSibling;
            if (siblingBox && siblingBox.classList.contains('mobile-feature-img-box')) {
                const mobileImg = siblingBox.querySelector('img');
                if (mobileImg) mobileImg.src = newSrc;
            }
        }
    }

    blackCards.forEach(card => {
        card.addEventListener('click', (event) => {
            const modeBtn = event.target.closest('.mode-sub-btn');
            
            // 서브 기능 (낮/밤 모드 버튼) 클릭 시
            if (modeBtn) {
                event.stopPropagation(); 
                const siblings = modeBtn.parentElement.querySelectorAll('.mode-sub-btn');
                siblings.forEach(btn => btn.classList.remove('active'));
                modeBtn.classList.add('active');
                
                const selectMode = modeBtn.getAttribute('data-mode');
                const newSrc = selectMode === CONFIG.MODE_LIGHT ? card.getAttribute('data-img-light') : card.getAttribute('data-img-dark');
                updateMainImage(newSrc, card);
                return; 
            }

            if (card.classList.contains('active')) return;

            // DOM 탐색 최소화를 위해 상태 변수 참조
            if (currentActiveBlackCard) {
                currentActiveBlackCard.classList.remove('active');
                const prevSiblingBox = currentActiveBlackCard.nextElementSibling;
                if (prevSiblingBox && prevSiblingBox.classList.contains('mobile-feature-img-box')) {
                    prevSiblingBox.classList.remove('active');
                }
            }

            card.classList.add('active');
            currentActiveBlackCard = card;

            const siblingBox = card.nextElementSibling;
            if (siblingBox && siblingBox.classList.contains('mobile-feature-img-box')) {
                siblingBox.classList.add('active');
            }

            // 이미지 소스 매핑 연동
            if (card.id === CONFIG.TAB_SERVICE_FLOW) {
                const activeModeBtn = card.querySelector('.mode-sub-btn.active');
                const selectedMode = activeModeBtn ? activeModeBtn.getAttribute('data-mode') : CONFIG.MODE_DARK;
                const newSrc = selectedMode === CONFIG.MODE_LIGHT ? card.getAttribute('data-img-light') : card.getAttribute('data-img-dark');
                updateMainImage(newSrc, card);
            } else {
                updateMainImage(card.getAttribute('data-img'), card);
            }
        });
    });

    // --- [4] 그레이 버튼 그룹 제어 엔진 (PC 그리드 순서 체인지 양방향 연동) ---
    const grayCards = document.querySelectorAll('.btn-variant-card.mod-gray');
    const infographicPanels = document.querySelectorAll('.arch-infographic-card');
    
    let currentGrayIndex = 0; // 활성화 인덱스 추적 상태 변수

    function activateGraySection(index) {
        if (currentGrayIndex === index) return; // 이미 활성화된 탭 클릭 시 무시

        if (grayCards[currentGrayIndex]) grayCards[currentGrayIndex].classList.remove('active');
        if (infographicPanels[currentGrayIndex]) infographicPanels[currentGrayIndex].classList.remove('active');

        if (grayCards[index]) grayCards[index].classList.add('active');
        if (infographicPanels[index]) infographicPanels[index].classList.add('active');
        
        currentGrayIndex = index;
    }

    grayCards.forEach((card) => {
        card.addEventListener('click', () => {
            activateGraySection(parseInt(card.getAttribute('data-index'), 10));
        });
    });

    infographicPanels.forEach((panel, index) => {
        panel.addEventListener('click', () => {
            activateGraySection(index);
        });
    });

    // --- [5] 모바일 반응형 햄버거 메뉴 토글 ---
    const hamburgerBtn = document.querySelector('.btn-hamburger');
    const gnbMenu = document.querySelector('.gnb');
    const body = document.body;

    if (hamburgerBtn && gnbMenu) {
        const toggleMenu = () => {
            hamburgerBtn.classList.toggle('active');
            gnbMenu.classList.toggle('active');
            body.classList.toggle('menu-open');
        };

        hamburgerBtn.addEventListener('click', toggleMenu);
        gnbMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', toggleMenu));
    }

    // --- [6] 조달청 검색창 타이핑 모션 ---
    const typingTextElement = document.querySelector('.js-typing-text');
    
    if (typingTextElement) {
        const textString = "플로우캣";
        let typingIdx = 0;
        let isDeleting = false;

        function typeSearchKeyword() {
            // 현재 인덱스만큼 텍스트를 잘라서 화면에 표시
            typingTextElement.textContent = textString.substring(0, typingIdx);

            // 타이핑 속도 조절 (칠 때는 200ms, 지울 때는 더 빠른 100ms)
            let typeSpeed = isDeleting ? 100 : 200;

            if (!isDeleting && typingIdx < textString.length) {
                // 1. 다 안 쳤으면 한 글자씩 추가
                typingIdx++;
            } else if (isDeleting && typingIdx > 0) {
                // 2. 지우는 중이면 한 글자씩 삭제
                typingIdx--;
            } else if (!isDeleting && typingIdx === textString.length) {
                // 3. 다 쳤으면 2.5초 동안 대기했다가 지우기 시작
                isDeleting = true;
                typeSpeed = 2500; 
            } else if (isDeleting && typingIdx === 0) {
                // 4. 다 지웠으면 0.5초 대기했다가 다시 타이핑 시작
                isDeleting = false;
                typeSpeed = 500;
            }

            // 계산된 속도(typeSpeed)에 맞춰 스스로를 다시 호출 (무한 반복)
            setTimeout(typeSearchKeyword, typeSpeed);
        }

        // 페이지 로드 후 1초 뒤에 타이핑 시작 (자연스러움을 위해)
        setTimeout(typeSearchKeyword, 1000);
    }

});
