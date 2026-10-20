# QuietPaws — App Flow

## Entry
Landing page → primary CTA → Demo section.

## Live flow
1. User opens the prototype.
2. Meeting Mode is visibly ON by default for demo clarity.
3. User taps Start Live Detection.
4. Browser requests camera + microphone permissions.
5. Vision model loads and camera stream starts.
6. Audio analysis starts.
7. Dog detections enter the temporal window.
8. Workspace geometry is evaluated.
9. Audio evidence is collected.
10. Fusion produces behavioral state + confidence context.
11. If Meeting Mode + approach + qualifying behavioral evidence are true, intervention becomes eligible.
12. Owner voice cue plays.
13. System observes approximately 2.6 seconds.
14. If dog movement away/workspace exit is verified → success → stop.
15. Otherwise one alternate cue plays.
16. Observe again.
17. If verified → success.
18. If not verified → stop + haptic owner alert.
19. Event is stored locally.

## Controlled demo flow
Scenario A → simulated approach → owner voice → simulated verification.
Scenario B → simulated first-cue failure → alternate cue → simulated verification.
Scenario C → simulated non-intervention.

## Legal/privacy flow
Footer → Privacy / Terms.
First visit → optional analytics consent banner.
Reject → analytics remains disabled.
Accept → site analytics script is loaded; ML loop is unchanged.

## Error flow
Camera/mic denied → explanatory state + controlled demo remains available.
Model load failure → visible error + controlled demo remains available.
Unsupported vibration → visual confirmation remains available.

## User exit
Stop Live Detection → media tracks released → audio context closed → UI reset.
