document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 캐싱
    const $ = (selector) => document.querySelector(selector);

    // OUT 코스 테이블 요소
    const scorecardTableOutHeadRow = $('#scorecard-table-out thead tr');
    const shotsRowOut = $('#shots-row-out');
    const puttsRowOut = $('#putts-row-out');
    const totalRowOut = $('#total-row-out');

    // IN 코스 테이블 요소
    const scorecardTableInHeadRow = $('#scorecard-table-in thead tr');
    const shotsRowIn = $('#shots-row-in');
    const puttsRowIn = $('#putts-row-in');
    const totalRowIn = $('#total-row-in');

    // 총 합계 테이블 요소
    const overallTotalValueCell = $('#overall-total-value');

    // 입력 컨트롤 요소
    const holeNumberSelect = $('#hole-number');
    const shotsInput = $('#shots');
    const puttsInput = $('#putts');
    const recordScoreBtn = $('#record-score-btn');
    const saveAsImageBtn = $('#save-as-image-btn');

    // 캡처 대상 컨테이너
    const scorecardContainer = $('#scorecard-container');

    // 골프장 이름 및 코스 입력/표시 요소
    const golfCourseNameInput = $('#golf-course-name');
    const golfCourseTypeInput = $('#golf-course-type');
    const golfCourseNameDisplay = $('#golf-course-name-display');
    const golfCourseTypeDisplay = $('#golf-course-type-display');


    const numberOfHoles = 18;
    const scores = {}; // 각 홀의 스코어 저장 { '1': { shots: 3, putts: 2 } }

    // 1. 초기화 함수
    const initializeScorecard = () => {
        // 홀 번호 드롭다운 메뉴 옵션 생성
        for (let i = 1; i <= numberOfHoles; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}번 홀`;
            holeNumberSelect.appendChild(option);
        }

        // OUT 코스 (1-9 홀) 테이블 헤더 및 셀 초기 생성
        for (let i = 1; i <= 9; i++) {
            const th = document.createElement('th');
            th.textContent = i;
            scorecardTableOutHeadRow.appendChild(th);

            shotsRowOut.appendChild(document.createElement('td'));
            puttsRowOut.appendChild(document.createElement('td'));
            totalRowOut.appendChild(document.createElement('td'));
        }
        // OUT 합계 헤더 및 셀 추가
        const outTh = document.createElement('th');
        outTh.textContent = 'OUT';
        scorecardTableOutHeadRow.appendChild(outTh);
        shotsRowOut.appendChild(document.createElement('td'));
        puttsRowOut.appendChild(document.createElement('td'));
        totalRowOut.appendChild(document.createElement('td'));


        // IN 코스 (10-18 홀) 테이블 헤더 및 셀 초기 생성
        for (let i = 10; i <= 18; i++) {
            const th = document.createElement('th');
            th.textContent = i;
            scorecardTableInHeadRow.appendChild(th);

            shotsRowIn.appendChild(document.createElement('td'));
            puttsRowIn.appendChild(document.createElement('td'));
            totalRowIn.appendChild(document.createElement('td'));
        }
        // IN 및 TOTAL 합계 헤더 및 셀 추가
        const inTh = document.createElement('th');
        inTh.textContent = 'IN';
        scorecardTableInHeadRow.appendChild(inTh);
        shotsRowIn.appendChild(document.createElement('td'));
        puttsRowIn.appendChild(document.createElement('td'));
        totalRowIn.appendChild(document.createElement('td'));

        const totalTh = document.createElement('th');
        totalTh.textContent = 'TOTAL';
        scorecardTableInHeadRow.appendChild(totalTh);
        shotsRowIn.appendChild(document.createElement('td'));
        puttsRowIn.appendChild(document.createElement('td'));
        totalRowIn.appendChild(document.createElement('td'));

        updateScorecard(); // 초기 화면 스코어 렌더링
        updateCourseInfoDisplay(); // 초기 골프장 정보 렌더링
    };

    // 골프장 이름과 코스 정보 표시 업데이트 함수
    const updateCourseInfoDisplay = () => {
        // 입력 필드의 값을 가져와서 표시 요소에 업데이트
        const courseName = golfCourseNameInput.value.trim();
        const courseType = golfCourseTypeInput.value.trim();

        golfCourseNameDisplay.textContent = courseName || '골프장 이름'; // 입력 없으면 기본 텍스트
        golfCourseTypeDisplay.textContent = courseType ? `(${courseType})` : '코스 정보'; // 입력 없으면 기본 텍스트
    };

    // 입력 필드 값 변경 시 골프장 정보 표시 업데이트
    golfCourseNameInput.addEventListener('input', updateCourseInfoDisplay);
    golfCourseTypeInput.addEventListener('input', updateCourseInfoDisplay);


    // 2. 스코어카드 표 업데이트 함수
    const updateScorecard = () => {
        let currentOutShots = 0, currentOutPutts = 0;
        let currentInShots = 0, currentInPutts = 0;
        let overallTotalShots = 0, overallTotalPutts = 0;

        // OUT 코스 (1-9 홀) 데이터 채우기
        for (let i = 1; i <= 9; i++) {
            const shotsCell = shotsRowOut.cells[i]; // row-header(0) 다음부터 홀 셀(1부터)
            const puttsCell = puttsRowOut.cells[i];
            const totalCell = totalRowOut.cells[i];

            const holeData = scores[i];

            if (holeData) {
                shotsCell.textContent = holeData.shots;
                puttsCell.textContent = holeData.putts;
                const holeTotal = holeData.shots + holeData.putts;
                totalCell.textContent = holeTotal;
                currentOutShots += holeData.shots;
                currentOutPutts += holeData.putts;
            } else {
                shotsCell.textContent = '';
                puttsCell.textContent = '';
                totalCell.textContent = '';
            }
        }
        // OUT 합계 셀 업데이트
        const outSummaryColIndex = 10; // 1(항목) + 9(홀) = 10
        shotsRowOut.cells[outSummaryColIndex].textContent = currentOutShots;
        puttsRowOut.cells[outSummaryColIndex].textContent = currentOutPutts;
        totalRowOut.cells[outSummaryColIndex].textContent = currentOutShots + currentOutPutts;
        
        overallTotalShots += currentOutShots;
        overallTotalPutts += currentOutPutts;

        // IN 코스 (10-18 홀) 데이터 채우기
        for (let i = 10; i <= 18; i++) {
            const shotsCell = shotsRowIn.cells[i - 9]; // 10번 홀은 index 1, 11번 홀은 index 2
            const puttsCell = puttsRowIn.cells[i - 9];
            const totalCell = totalRowIn.cells[i - 9];

            const holeData = scores[i];

            if (holeData) {
                shotsCell.textContent = holeData.shots;
                puttsCell.textContent = holeData.putts;
                const holeTotal = holeData.shots + holeData.putts;
                totalCell.textContent = holeTotal;
                currentInShots += holeData.shots;
                currentInPutts += holeData.putts;
            } else {
                shotsCell.textContent = '';
                puttsCell.textContent = '';
                totalCell.textContent = '';
            }
        }
        // IN 합계 셀 업데이트
        const inSummaryColIndex = 10; // 1(항목) + 9(홀) = 10
        shotsRowIn.cells[inSummaryColIndex].textContent = currentInShots;
        puttsRowIn.cells[inSummaryColIndex].textContent = currentInPutts;
        totalRowIn.cells[inSummaryColIndex].textContent = currentInShots + currentInPutts;

        overallTotalShots += currentInShots;
        overallTotalPutts += currentInPutts;

        // TOTAL 합계 셀 업데이트
        const overallSummaryColIndex = 11; // 1(항목) + 9(홀) + 1(IN) = 11
        shotsRowIn.cells[overallSummaryColIndex].textContent = overallTotalShots;
        puttsRowIn.cells[overallSummaryColIndex].textContent = overallTotalPutts;
        totalRowIn.cells[overallSummaryColIndex].textContent = overallTotalShots + overallTotalPutts;

        // 최종 총 합계 (Footer) 업데이트
        overallTotalValueCell.textContent = overallTotalShots + overallTotalPutts;
    };

    // 3. 이벤트 리스너 설정
    recordScoreBtn.addEventListener('click', () => {
        const currentHole = parseInt(holeNumberSelect.value);
        const shots = parseInt(shotsInput.value);
        const putts = parseInt(puttsInput.value);

        if (isNaN(currentHole) || currentHole < 1 || currentHole > numberOfHoles || isNaN(shots) || shots < 1 || isNaN(putts) || putts < 0) {
            alert('유효한 홀 번호와 샷/퍼팅 수를 입력해주세요. (샷 수는 1 이상, 퍼팅 수는 0 이상)');
            return;
        }

        scores[currentHole] = { shots, putts };
        updateScorecard();

        // 다음 홀로 자동 이동
        const nextHole = currentHole + 1;
        if (nextHole <= numberOfHoles) {
            holeNumberSelect.value = nextHole;
            shotsInput.value = '3';
            puttsInput.value = '2';
        } else {
            alert('모든 홀의 스코어 입력을 완료했습니다!');
        }
    });

    saveAsImageBtn.addEventListener('click', () => {
        // ⭐ 캡처 전용 클래스 추가 (레이아웃 변경)
        scorecardContainer.classList.add('capture-layout');

        // html2canvas로 캡처 실행
        html2canvas(scorecardContainer, {
            scale: 2, // 고해상도 이미지 (필요에 따라 3 이상으로 높일 수 있음)
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff' // 배경색을 흰색으로 지정
        }).then(canvas => {
            const link = document.createElement('a');
            const date = new Date().toISOString().slice(0,10); // YYYY-MM-DD
            const courseName = golfCourseNameInput.value.trim() || '골프스코어카드';
            link.download = `${courseName}_${date}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }).catch(error => {
            console.error('이미지 저장 중 오류 발생:', error);
            alert('스코어카드 이미지를 저장하는 데 실패했습니다. 개발자 콘솔을 확인해주세요.');
        }).finally(() => {
            // ⭐ 캡처 후 클래스 제거 (원래 레이아웃으로 복원)
            scorecardContainer.classList.remove('capture-layout');
        });
    });

    // 초기화 함수 호출
    initializeScorecard();
});
