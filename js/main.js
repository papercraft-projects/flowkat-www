// ==========================================================================
// 플로우캣 웹 인터페이스 통합 제어 스크립트
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    /* --------------------------------------------------------------------------
       [1] 조달청 검색창 클릭 시 상세 상품명세 드롭다운 토글
       -------------------------------------------------------------------------- */
    const searchTriggerBox = document.querySelector('.portal-search-trigger-box');
    if (searchTriggerBox) {
        searchTriggerBox.addEventListener('click', (e) => {
            if (e.target.closest('.portal-search-dropdown')) return;
            searchTriggerBox.classList.toggle('active');
        });
    }

    /* --------------------------------------------------------------------------
       [2] 블랙 버튼 그룹 제어 엔진 (모바일 아코디언 및 PC 화면 교체)
       -------------------------------------------------------------------------- */
    const blackCards = document.querySelectorAll('.btn-variant-card.mod-black');
    const mainDashboardScreen = document.getElementById('feature-main-screen');

    function updateMainImage(newSrc, currentCard) {
        if (!newSrc) return;
        
        // PC 메인 디스플레이 화면 전환
        if (mainDashboardScreen) {
            const currentFileName = mainDashboardScreen.src.split('/').pop();
            const newFileName = newSrc.split('/').pop();
            if (currentFileName !== newFileName) {
                mainDashboardScreen.style.opacity = '0';
                setTimeout(() => {
                    mainDashboardScreen.src = newSrc;
                    mainDashboardScreen.style.opacity = '1';
                }, 250); 
            }
        }

        // 클릭된 블랙 버튼 바로 하위의 모바일 이미지 박스 소스 동기화
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
            // 서브 기능 (낮/밤 모드 버튼) 클릭 시
            const modeBtn = event.target.closest('.mode-sub-btn');
            if (modeBtn) {
                event.stopPropagation(); 
                const siblings = modeBtn.parentElement.querySelectorAll('.mode-sub-btn');
                siblings.forEach(btn => btn.classList.remove('active'));
                modeBtn.classList.add('active');
                
                const selectMode = modeBtn.getAttribute('data-mode');
                const newSrc = selectMode === 'light' ? card.getAttribute('data-img-light') : card.getAttribute('data-img-dark');
                updateMainImage(newSrc, card);
                return; 
            }

            if (card.classList.contains('active')) return;

            // 블랙 카드 및 아코디언 활성화 전환
            const activeBlack = document.querySelector('.btn-variant-card.mod-black.active');
            if (activeBlack) activeBlack.classList.remove('active');
            document.querySelectorAll('.mobile-feature-img-box').forEach(box => box.classList.remove('active'));

            card.classList.add('active');

            const siblingBox = card.nextElementSibling;
            if (siblingBox && siblingBox.classList.contains('mobile-feature-img-box')) {
                siblingBox.classList.add('active');
            }

            // 이미지 소스 매핑 연동
            if (card.id === 'tab-service-flow') {
                const activeModeBtn = card.querySelector('.mode-sub-btn.active');
                const selectedMode = activeModeBtn ? activeModeBtn.getAttribute('data-mode') : 'dark';
                const newSrc = selectedMode === 'light' ? card.getAttribute('data-img-light') : card.getAttribute('data-img-dark');
                updateMainImage(newSrc, card);
            } else {
                updateMainImage(card.getAttribute('data-img'), card);
            }
        });
    });

    /* --------------------------------------------------------------------------
       [3] 그레이 버튼 그룹 제어 엔진 (PC 그리드 순서 체인지 양방향 연동)
       -------------------------------------------------------------------------- */
    const grayCards = document.querySelectorAll('.btn-variant-card.mod-gray');
    const infographicPanels = document.querySelectorAll('.arch-infographic-card');

    function activateGraySection(index) {
        const activeGray = document.querySelector('.btn-variant-card.mod-gray.active');
        const activePanel = document.querySelector('.arch-infographic-card.active');
        
        if (activeGray) activeGray.classList.remove('active');
        if (activePanel) activePanel.classList.remove('active');

        if (grayCards[index]) grayCards[index].classList.add('active');
        if (infographicPanels[index]) infographicPanels[index].classList.add('active');
    }

    grayCards.forEach((card) => {
        card.addEventListener('click', () => {
            if (card.classList.contains('active')) return;
            activateGraySection(parseInt(card.getAttribute('data-index'), 10));
        });
    });

    infographicPanels.forEach((panel, index) => {
        panel.addEventListener('click', () => {
            if (panel.classList.contains('active')) return;
            activateGraySection(index);
        });
    });

    /* --------------------------------------------------------------------------
       [4] 모바일 반응형 햄버거 메뉴 토글
       -------------------------------------------------------------------------- */
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
});