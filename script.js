document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 캐싱
    const $ = (selector) => document.querySelector(selector); // 짧은 셀렉터 함수
    const $$ = (selector) => document.querySelectorAll(selector); // 여러 요소 선택 함수

    const scorecardTableHeadRow = $('#scorecard-table thead tr');
    const shotsRow = $('#shots-row');
    const puttsRow = $('#putts-row');
    const totalRow = $('#total-row');
    const totalFooterRow = $('#scorecard-table tfoot tr');
    const holeNumberSelect = $('#hole-number');
    const shotsInput = $('#shots');
    const puttsInput = $('#putts');
    const recordScoreBtn = $('#record-score-btn');
    const saveAsImageBtn = $('#save-as-image-btn');
    const scorecardContainer = $('#scorecard-container'); // 이미지 저장 대상

    const golfCourseNameInput = $('#golf-course-name'); // 골프장 이름 입력 필드
    const golfCourseTypeInput = $('#golf-course-type'); // 코스 입력 필드


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

        // 스코어카드 테이블 헤더 및 셀 초기 생성 (1~18번 홀, OUT, IN, TOTAL)
        for (let i = 1; i <= numberOfHoles; i++) {
            const th = document.createElement('th');
            th.textContent = i;
            scorecardTableHeadRow.appendChild(th);

            // tbody의 각 행에 빈 td 추가
            shotsRow.appendChild(document.createElement('td'));
            puttsRow.appendChild(document.createElement('td'));
            totalRow.appendChild(document.createElement('td'));
        }

        // OUT, IN, TOTAL 헤더 및 셀 추가
        const summaryHeaders = ['OUT', 'IN', 'TOTAL'];
        summaryHeaders.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            scorecardTableHeadRow.appendChild(th);

            shotsRow.appendChild(document.createElement('td'));
            puttsRow.appendChild(document.createElement('td'));
            totalRow.appendChild(document.createElement('td'));
        });

        // tfoot에 총 합계 셀 추가 (colSpan 조정)
        const totalOverallCell = document.createElement('td');
        // colSpan은 th(항목)를 제외한 나머지 모든 셀을 병합해야 하므로 (numberOfHoles + summaryHeaders.length)
        totalOverallCell.colSpan = numberOfHoles + summaryHeaders.length;
        totalOverallCell.textContent = '0';
        totalFooterRow.appendChild(totalOverallCell);

        updateScorecard(); // 초기 화면 렌더링
    };

    // 2. 스코어카드 표 업데이트 함수
    const updateScorecard = () => {
        let outShots = 0, outPutts = 0;
        let inShots = 0, inPutts = 0;
        let totalShots = 0, totalPutts = 0;

        for (let i = 1; i <= numberOfHoles; i++) {
            // 셀 인덱스: row-header(0) 다음부터 홀 셀(1부터)
            const shotsCell = shotsRow.cells[i];
            const puttsCell = puttsRow.cells[i];
            const totalCell = totalRow.cells[i];

            const holeData = scores[i];

            if (holeData) {
                shotsCell.textContent = holeData.shots;
                puttsCell.textContent = holeData.putts;
                const holeTotal = holeData.shots + holeData.putts;
                totalCell.textContent = holeTotal;

                if (i <= 9) { // OUT (1~9번 홀)
                    outShots += holeData.shots;
                    outPutts += holeData.putts;
                } else { // IN (10~18번 홀)
                    inShots += holeData.shots;
                    inPutts += holeData.putts;
                }
                totalShots += holeData.shots;
                totalPutts += holeData.putts;
            } else {
                // 입력되지 않은 홀은 빈 칸으로 유지
                shotsCell.textContent = '';
                puttsCell.textContent = '';
                totalCell.textContent = '';
            }
        }

        // OUT, IN, TOTAL 값 업데이트 (셀 인덱스 주의)
        const outColIndex = numberOfHoles + 1;
        const inColIndex = numberOfHoles + 2;
        const totalColIndex = numberOfHoles + 3;

        shotsRow.cells[outColIndex].textContent = outShots;
        puttsRow.cells[outColIndex].textContent = outPutts;
        totalRow.cells[outColIndex].textContent = outShots + outPutts;

        shotsRow.cells[inColIndex].textContent = inShots;
        puttsRow.cells[inColIndex].textContent = inPutts;
        totalRow.cells[inColIndex].textContent = inShots + inPutts;

        shotsRow.cells[totalColIndex].textContent = totalShots;
        puttsRow.cells[totalColIndex].textContent = totalPutts;
        const overallTotalScore = totalShots + totalPutts;
        totalRow.cells[totalColIndex].textContent = overallTotalScore;

        // Footer의 총 합계 업데이트
        totalFooterRow.cells[0].textContent = overallTotalScore;
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
            // 모든 홀 입력 완료 후 입력 필드 비활성화 등 추가 가능
        }
    });

    saveAsImageBtn.addEventListener('click', () => {
        // 이미지 저장 시 골프장 이름과 코스도 캡처 범위에 포함되도록 컨테이너 조정
        // 현재 scorecardContainer는 테이블만 감싸고 있으므로,
        // 전체 .container를 캡처하는 것이 더 자연스럽습니다.
        // 하지만 요청하신 이미지는 스코어 테이블만 캡처하는 느낌이므로,
        // 기존처럼 scorecardContainer를 캡처하되, 캡처 전에 입력 필드 값들을 업데이트하여 표에 표시할 수 있는 기능을 고려할 수 있습니다.
        // 여기서는 가장 간단하게 전체 .container를 캡처하도록 변경합니다.
        html2canvas($('.container'), { // .container 전체를 캡처 대상으로 변경
            scale: 2,
            useCORS: true,
            logging: false, // 배포 시에는 false로 설정
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const link = document.createElement('a');
            // 파일 이름에 골프장 이름과 날짜를 포함 (선택 사항)
            const date = new Date().toISOString().slice(0,10); // YYYY-MM-DD
            const courseName = golfCourseNameInput.value || '골프스코어카드';
            link.download = `${courseName}_${date}.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }).catch(error => {
            console.error('이미지 저장 중 오류 발생:', error);
            alert('스코어카드 이미지를 저장하는 데 실패했습니다. 개발자 콘솔을 확인해주세요.');
        });
    });

    // 초기화 함수 호출
    initializeScorecard();
});