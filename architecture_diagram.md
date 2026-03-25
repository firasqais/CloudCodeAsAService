# Architecture Diagram (Conceptual)

```
Users
  ↓
Public Web Network Profile
  ↓
Application Instance(s)
  ↓
Object Storage
```

## Scaling version

```
Users
  ↓
Load Balancer
  ↓
Instance A   Instance B   Instance C   Instance D   Instance E
  ↓
Shared Storage
```
