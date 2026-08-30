# Harness Factory - Team Onboarding Master Guide

Complete guide for onboarding all types of engineers to the Harness Factory project.

---

## 🎯 Choose Your Role

Select the onboarding guide that matches your role:

### For General Developers & New Starters
**→ Read: [ONBOARDING.md](./ONBOARDING.md)** (30 minutes)

Perfect if you're:
- New to the team
- Getting familiar with the system
- Want a broad overview
- Starting hands-on work

**Covers:**
- Complete setup (30 min)
- Architecture overview (1 hour)
- First contribution (day 3-5)
- Testing procedures
- Learning path

---

### For Backend Engineers
**→ Read: [BACKEND_ENGINEER_ONBOARDING.md](./BACKEND_ENGINEER_ONBOARDING.md)** (1-2 hours)

Perfect if you're:
- Building core components
- Developing APIs
- Managing data
- Optimizing algorithms

**Covers:**
- Core components (Brain-Wiki, Consilient, Harvester, Curator, Army-Agents)
- API development
- Data management and optimization
- Testing strategies
- Database design
- Performance tuning

**Day 1-5 Timeline:**
- Day 1: Setup & architecture
- Day 2: Brain-Wiki deep dive
- Day 3: Consilient & Harvester
- Day 4: Testing & Curator
- Day 5: API development

---

### For Frontend Engineers
**→ Read: [FRONTEND_ENGINEER_ONBOARDING.md](./FRONTEND_ENGINEER_ONBOARDING.md)** (1-2 hours)

Perfect if you're:
- Building the dashboard
- Creating UI components
- Implementing visualizations
- Improving user experience

**Covers:**
- VI-Dashboard architecture
- Widget system and components
- API integration
- Real-time updates
- Responsive design
- Styling and theming
- Testing and performance

**Day 1-5 Timeline:**
- Day 1: Setup & dashboard overview
- Day 2: Widget system
- Day 3: Component architecture
- Day 4: API integration
- Day 5: Testing & styling

---

### For Platform Engineers
**→ Read: [PLATFORM_ENGINEER_ONBOARDING.md](./PLATFORM_ENGINEER_ONBOARDING.md)** (2-3 hours)

Perfect if you're:
- Managing infrastructure
- Deploying systems
- Setting up Kubernetes
- Monitoring and scaling
- Handling incidents

**Covers:**
- Kubernetes deployment
- Docker image management
- GitOps with ArgoCD
- Monitoring and observability
- Security and compliance
- Backup and disaster recovery
- CI/CD automation
- Incident response

**Day 1-7 Timeline:**
- Day 1: Setup & prerequisites
- Day 2: Kubernetes architecture
- Day 3: Manual deployment
- Day 4: ArgoCD GitOps
- Day 5: Monitoring & security
- Day 6: Backup & recovery
- Day 7: CI/CD & automation

---

## 📊 Role Comparison

| Aspect | Backend | Frontend | Platform |
|--------|---------|----------|----------|
| **Focus** | Core logic, APIs | UI, UX, Dashboards | Infrastructure, Ops |
| **Main Tools** | Node.js, Git | HTML/CSS/JS, Git | Kubernetes, Docker |
| **Key Components** | Brain-Wiki, Consilient | VI-Dashboard | K8s, ArgoCD, Terraform |
| **Testing** | Unit, Integration | Unit, Visual, E2E | Load, Security, Disaster |
| **Success Metric** | Algorithm efficiency | UX quality | System reliability |
| **Week 1 Goal** | Make API contribution | UI component | Deploy to K8s |

---

## 🚀 Complete Onboarding Roadmap

### Week 1: Everyone (Shared Path)

**Day 1 (All roles):**
```bash
# 1. Setup (30 min)
git clone --recursive https://github.com/Harness FactorySolutions/harness-factory.git
cd harness-factory
npm install

# 2. Deploy (15 min)
./deploy.sh --full

# 3. Verify (5 min)
curl http://localhost:3000/api/health | jq
open http://localhost:3001  # Dashboard
```

**Day 2-5:**
- Read role-specific onboarding guide (1-2 hours)
- Explore assigned component area (2 hours)
- Run tests for your component (1 hour)
- Make first code change (2 hours)

---

### Week 2-4: Role-Specific Focus

#### Backend Engineers

**Week 2:**
- Pick a component (Brain-Wiki, Consilient, Harvester, Curator, Army-Agents)
- Study its source code (4 hours)
- Write new feature or fix bug (4 hours)
- Write tests (2 hours)
- Get code review (1 hour)

**Week 3-4:**
- Lead component improvement
- Mentor junior developer
- Optimize performance

#### Frontend Engineers

**Week 2:**
- Understand widget system (2 hours)
- Add new widget type (3 hours)
- Integrate with API (2 hours)
- Style and test (2 hours)
- Code review (1 hour)

**Week 3-4:**
- Improve dashboard UX
- Add visualization features
- Mentor junior developer

#### Platform Engineers

**Week 2:**
- Setup monitoring (ArgoCD, Prometheus) (4 hours)
- Write incident runbook (2 hours)
- Test disaster recovery (2 hours)
- Optimize resources (2 hours)

**Week 3-4:**
- Lead infrastructure improvement
- Train team on operations
- Setup auto-scaling

---

## 📋 Universal Onboarding Checklist

### Week 1: Everyone

```
Day 1:
☐ Clone repository
☐ Install prerequisites
☐ npm install
☐ npm test (all pass)
☐ Deploy with ./deploy.sh --full
☐ Access API and dashboard
☐ Register in AGENTS.md

Day 2-3:
☐ Read role-specific guide
☐ Understand architecture
☐ Explore assigned component
☐ Read component README
☐ Run component tests

Day 4-5:
☐ Find first task
☐ Create feature branch
☐ Make code change
☐ Write/update tests
☐ Create PR
☐ Get code review feedback
```

### Week 2-4: Role-Specific

**All Roles:**
```
☐ First PR merged
☐ Second contribution (or larger feature)
☐ Code review a teammate
☐ Document something
☐ Lead a task
☐ Help onboard next person
```

**Backend:**
```
☐ Understand component internals
☐ Optimized query or algorithm
☐ Improved test coverage
☐ Fixed bug or added feature
```

**Frontend:**
```
☐ Built new UI component
☐ Integrated with API
☐ Improved styling/theme
☐ Added visualization
```

**Platform:**
```
☐ Deployed to production
☐ Setup monitoring
☐ Written runbook
☐ Handled incident
```

---

## 🎯 Success Metrics by Role

### Backend Engineer Success

**Week 1:**
- ✅ Can run tests locally
- ✅ Understand core components
- ✅ Made first API contribution
- ✅ Tests passing

**Month 1:**
- ✅ Owned a component
- ✅ Optimized algorithm/query
- ✅ Led code review
- ✅ Mentored junior dev

### Frontend Engineer Success

**Week 1:**
- ✅ Dashboard running
- ✅ Understand widget system
- ✅ Made UI improvement
- ✅ Tests passing

**Month 1:**
- ✅ Built new feature
- ✅ Improved UX/styling
- ✅ Led design review
- ✅ Mentored junior dev

### Platform Engineer Success

**Week 1:**
- ✅ Deployed to K8s
- ✅ Understand ArgoCD
- ✅ Setup monitoring
- ✅ Written runbook

**Month 1:**
- ✅ Handled incident
- ✅ Setup auto-scaling
- ✅ Led security audit
- ✅ Trained team

---

## 📚 Documentation Map

```
Quick Reference
├── QUICK_START.md                    ← 5 min overview
├── COMMANDS_REFERENCE.md             ← Print this!
└── TEAM_ONBOARDING.md               ← You are here

General Onboarding
├── ONBOARDING.md                     ← All new starters
└── Role-Specific Guides:
    ├── BACKEND_ENGINEER_ONBOARDING.md
    ├── FRONTEND_ENGINEER_ONBOARDING.md
    └── PLATFORM_ENGINEER_ONBOARDING.md

Technical Details
├── HARNESS_COMPLETION_SUMMARY.md     ← System overview
├── TESTING_GUIDE.md                  ← Testing procedures
├── KUBERNETES_DEPLOYMENT.md          ← K8s guide
└── Component READMEs
    ├── ai/brain-wiki/README.md
    ├── ai/consilient/README.md
    ├── ai/harvester/README.md
    ├── ai/curator/README.md
    ├── ai/army-agents/README.md
    ├── ai/vi-dashboard/README.md
    └── ai/integration/README.md
```

---

## 🔄 Onboarding Flow Diagram

```
New Team Member Joins
│
├─→ First Time Here?
│   └─→ Read QUICK_START.md (5 min)
│       └─→ Run ./deploy.sh --full (15 min)
│           └─→ Verify system running
│
└─→ Pick Your Role:
    │
    ├─→ Backend Engineer
    │   └─→ BACKEND_ENGINEER_ONBOARDING.md
    │       ├─→ Core Components (Day 2)
    │       ├─→ API Development (Day 3)
    │       ├─→ Testing (Day 4)
    │       └─→ First Contribution (Day 5)
    │
    ├─→ Frontend Engineer
    │   └─→ FRONTEND_ENGINEER_ONBOARDING.md
    │       ├─→ Widget System (Day 2)
    │       ├─→ UI Components (Day 3)
    │       ├─→ API Integration (Day 4)
    │       └─→ First Contribution (Day 5)
    │
    └─→ Platform Engineer
        └─→ PLATFORM_ENGINEER_ONBOARDING.md
            ├─→ Kubernetes (Day 2-3)
            ├─→ GitOps/ArgoCD (Day 3-4)
            ├─→ Monitoring (Day 5)
            └─→ First Deployment (Day 6-7)
```

---

## 👥 Team Communication

### During Onboarding

1. **Register in AGENTS.md**
   ```bash
   # Add your row showing what you're working on
   vim AGENTS.md
   git add AGENTS.md
   git commit -m "chore: register [name] onboarding in [area]"
   git push
   ```

2. **Get Help**
   - Check relevant onboarding guide
   - Check component README
   - Check COMMANDS_REFERENCE.md
   - Ask on Slack (link in guide)

3. **Make Contributions**
   - Create feature branch
   - Make code change
   - Write/update tests
   - Create PR and ask for review

4. **Collaborate**
   - Pair program with team member
   - Review others' code
   - Share knowledge

### After Onboarding (Month 2+)

1. **Become Mentor**
   - Help onboard next team member
   - Lead code reviews
   - Document best practices

2. **Lead Improvements**
   - Suggest optimizations
   - Design new features
   - Mentor junior devs

3. **Cross-Functional**
   - Understand all components
   - Help other teams
   - Share knowledge

---

## 🎓 Learning Resources

### By Role

**Backend:**
- [BACKEND_ENGINEER_ONBOARDING.md](./BACKEND_ENGINEER_ONBOARDING.md)
- Component source code (ai/*/src/)
- Test files (ai/*/tests/)

**Frontend:**
- [FRONTEND_ENGINEER_ONBOARDING.md](./FRONTEND_ENGINEER_ONBOARDING.md)
- ai/vi-dashboard/ directory
- HTML/CSS/JavaScript files

**Platform:**
- [PLATFORM_ENGINEER_ONBOARDING.md](./PLATFORM_ENGINEER_ONBOARDING.md)
- k8s/ directory (manifests)
- KUBERNETES_DEPLOYMENT.md
- .github/workflows/ (CI/CD)

### Universal

- [HARNESS_COMPLETION_SUMMARY.md](./HARNESS_COMPLETION_SUMMARY.md) - Architecture
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing
- [COMMANDS_REFERENCE.md](./COMMANDS_REFERENCE.md) - Commands
- [QUICK_START.md](./QUICK_START.md) - Quick reference

---

## ✅ Onboarding Completion Checklist

### Week 1 (All Roles)

```
Setup:
☐ Repository cloned
☐ Dependencies installed
☐ System deployed locally
☐ All tests passing

Understanding:
☐ Architecture understood
☐ Component knowledge gained
☐ Read role-specific guide
☐ Read HARNESS_COMPLETION_SUMMARY.md

First Contribution:
☐ Feature branch created
☐ Code change made
☐ Tests written/updated
☐ PR created
☐ Code reviewed by team
```

### Week 2-4 (Role-Specific)

**Backend:**
```
☐ Component mastery
☐ Algorithm optimized or feature added
☐ Test coverage improved
☐ Code review led
```

**Frontend:**
```
☐ Built new widget or improved existing
☐ API integration complete
☐ Styling and UX improved
☐ Visual test added
```

**Platform:**
```
☐ Deployment to K8s successful
☐ Monitoring setup complete
☐ Runbook written
☐ Incident handled
```

### Month 1+ (All Roles)

```
☐ Owned assigned area
☐ Led significant feature/improvement
☐ Mentored new team member
☐ Code review capability
☐ Contributed to documentation
```

---

## 🚀 Fast-Track Onboarding (For Experienced Engineers)

If you're experienced with similar systems:

1. **Day 1 (2 hours):**
   - Clone and deploy: `./deploy.sh --full`
   - Skim role-specific guide
   - Explore component code

2. **Day 2 (2 hours):**
   - Review architecture
   - Understand data flow
   - Run tests

3. **Day 3+ (ongoing):**
   - Make contributions
   - Deep dive as needed
   - Reference docs when needed

---

## 📞 Quick Navigation

**Getting Started:**
- New to the team? → [ONBOARDING.md](./ONBOARDING.md)
- Need commands? → [COMMANDS_REFERENCE.md](./COMMANDS_REFERENCE.md)
- Want quick start? → [QUICK_START.md](./QUICK_START.md)

**By Role:**
- Backend → [BACKEND_ENGINEER_ONBOARDING.md](./BACKEND_ENGINEER_ONBOARDING.md)
- Frontend → [FRONTEND_ENGINEER_ONBOARDING.md](./FRONTEND_ENGINEER_ONBOARDING.md)
- Platform → [PLATFORM_ENGINEER_ONBOARDING.md](./PLATFORM_ENGINEER_ONBOARDING.md)

**Technical Details:**
- System overview → [HARNESS_COMPLETION_SUMMARY.md](./HARNESS_COMPLETION_SUMMARY.md)
- Testing guide → [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- Kubernetes → [KUBERNETES_DEPLOYMENT.md](./KUBERNETES_DEPLOYMENT.md)

---

## 📊 Onboarding Timeline Summary

| Timeline | General Dev | Backend | Frontend | Platform |
|----------|-------------|---------|----------|----------|
| **Day 1** | Setup & Deploy | Setup & Deploy | Setup & Deploy | Setup & Deploy |
| **Day 2-3** | Architecture | Components | Dashboard | Kubernetes |
| **Day 4-5** | First Contribution | API & Tests | UI & Integration | GitOps & Monitoring |
| **Week 2** | Learning | Feature | Component | Deployment |
| **Week 3-4** | Contributing | Optimization | UX Improvement | Operations |
| **Month 1** | Productive Member | Component Owner | Feature Leader | On-Call Ready |

---

## 🎉 Welcome to the Team!

You now have everything needed to:

✅ Get the system running locally  
✅ Understand the architecture  
✅ Choose your focus area  
✅ Make your first contribution  
✅ Grow as an engineer  

**Let's build something amazing together!** 🚀

---

**Version**: 1.0.0  
**Last Updated**: 2026-08-29  
**For**: All Harness Factory team members
