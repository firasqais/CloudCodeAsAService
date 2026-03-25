# Week 7 — Infrastructure Automation Simulation

This repository supports the Week 7 lab on **Automation & Infrastructure as Code (IaC)**.

## Files included
- `infrastructure_config.json` — the main configuration students edit
- `resources.json` — reference definitions used by the simulation
- `deploy_simulation.py` — simulates an automated infrastructure deployment
- `architecture_diagram.md` — simple diagram students can view while completing the lab

## Student task summary
1. Read `infrastructure_config.json`
2. Identify the server, storage, and network definitions
3. Modify:
   - `instance_size`
   - `region`
   - `number_of_instances`
4. Run:
   `python deploy_simulation.py`
5. Observe repeatability and scaling behaviour

## Suggested changes for students
- Change `instance_size` from `small` to `medium`
- Change `region` from `ap-southeast-2` to `us-east-1`
- Change `number_of_instances` from `1` to `5`

## Learning focus
This is not real AWS provisioning. It is a **conceptual IaC simulation** that helps students understand:
- repeatable infrastructure deployment
- parameter-driven infrastructure design
- scaling logic
- operational benefits and risks of automation
