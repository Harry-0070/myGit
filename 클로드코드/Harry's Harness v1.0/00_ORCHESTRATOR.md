# 🎯 ORCHESTRATOR — Harry's Harness v1.0

## 시스템 개요

이 문서는 **코딩 하네스 시스템의 최상위 오케스트레이터**입니다.
모든 서브 에이전트를 조율하고, 작업 흐름을 제어하며, 반복 평가 루프를 관리합니다.

---

## 아키텍처 구조

```
┌─────────────────────────────────────────────────┐
│                 ORCHESTRATOR                     │
│            (본 문서 — 전체 흐름 제어)              │
└──────┬──────┬──────┬──────┬─────────────────────┘
       │      │      │      │
       ▼      ▼      ▼      ▼
   ┌──────┐┌──────┐┌──────┐┌──────┐
   │PLAN  ││DESIGN││GENER ││EVAL  │
   │NER   ││ER    ││ATOR  ││UATOR │
   └──────┘└──────┘└──────┘└──────┘
       │      │      │      │
       └──────┴──────┴──────┘
                  │
           ┌──────────┐
           │ SCORING  │
           │ CRITERIA │
           └──────────┘
```

---

## 실행 프로토콜

### Phase 0: 입력 수신
1. 사용자로부터 **코딩 요청(Task)**을 수신한다.
2. 요청을 분석하여 Task 객체를 생성한다.

```yaml
Task:
  id: "TASK-{timestamp}"
  description: "{사용자 요청 원문}"
  type: "feature | bugfix | refactor | new_project"
  constraints: "{사용자가 명시한 제약사항}"
  iteration: 0
  max_iterations: 3
  status: "initialized"
```

### Phase 1: PLANNING (→ 01_PLANNER.md)
- Planner 에이전트를 호출한다.
- 입력: Task 객체
- 출력: Plan 객체 (구조, 파일 목록, 기술 스택, 단계별 계획)

### Phase 2: DESIGNING (→ 02_DESIGNER.md)
- Designer 에이전트를 호출한다.
- 입력: Task 객체 + Plan 객체
- 출력: Design 객체 (아키텍처, 인터페이스, 데이터 모델, 컴포넌트 설계)

### Phase 3: GENERATING (→ 03_GENERATOR.md)
- Generator 에이전트를 호출한다.
- 입력: Task 객체 + Plan 객체 + Design 객체
- 출력: Code 객체 (실제 코드 파일들)

### Phase 4: EVALUATING (→ 04_EVALUATOR.md)
- Evaluator 에이전트를 호출한다.
- 입력: Task 객체 + Plan 객체 + Design 객체 + Code 객체
- 참조: 05_SCORING_CRITERIA.md
- 출력: Evaluation 객체 (점수, 피드백, 개선 지시사항)

### Phase 5: 반복 판정
- Evaluation 결과를 확인한다.
- **합격 기준**: 총점 80점 이상 AND 모든 카테고리 60점 이상
- 미달 시: iteration += 1, Phase 2로 복귀 (피드백 포함)
- 합격 시 또는 max_iterations 도달 시: Phase 6으로 진행

---

## 🔄 반복 루프 규칙

```
[최소 3회 반복 보장]

Round 1: Plan → Design → Generate → Evaluate
  └─ 피드백 수집, 기초 품질 확보

Round 2: (피드백 반영) → Re-Design → Re-Generate → Re-Evaluate
  └─ 구조적 개선, 엣지 케이스 처리

Round 3: (피드백 반영) → Re-Design → Re-Generate → Final Evaluate
  └─ 최종 품질 다듬기, 코드 정리

※ 3회차에도 합격 기준 미달 시 → 최대 5회까지 추가 반복 허용
※ 5회 도달 시 → 현재 최선의 결과물 + 잔여 이슈 보고서 출력
```

---

## 에이전트 간 데이터 전달 형식

각 에이전트는 아래의 표준 출력 포맷을 따른다:

```yaml
AgentOutput:
  agent: "{에이전트 이름}"
  iteration: {현재 반복 회차}
  status: "complete | needs_revision"
  artifact: {실제 산출물}
  notes: "{다음 에이전트에게 전달할 참고사항}"
  issues_found: []  # 발견된 문제점 리스트
```

---

## 핵심 원칙

1. **생성과 평가의 분리**: Generator는 절대 자기 코드를 평가하지 않는다. Evaluator는 절대 코드를 수정하지 않는다.
2. **반복적 개선**: 최소 3회 반복을 통해 품질을 점진적으로 높인다.
3. **추적 가능성**: 모든 변경 사항과 피드백은 iteration 번호와 함께 기록된다.
4. **피드백 기반 개선**: Evaluator의 피드백은 구체적이고 실행 가능해야 한다.
5. **점진적 향상**: 각 반복에서 이전 피드백의 최소 80%를 해결해야 한다.

---

## 오케스트레이터 실행 로그 템플릿

```yaml
ExecutionLog:
  task_id: "TASK-{timestamp}"
  iterations:
    - round: 1
      planner_output: "{요약}"
      designer_output: "{요약}"
      generator_output: "{파일 목록}"
      evaluator_score: {총점}
      passed: false
      feedback_summary: "{핵심 피드백}"
    - round: 2
      # ...
  final_result:
    total_iterations: 3
    final_score: {최종 점수}
    delivered_files: []
    remaining_issues: []
```
