# Tool Groups

## Session + Connection
- `ibmi.connections.list`
- `ibmi.connect`
- `ibmi.disconnect`
- `ibmi.session.list`
- `ibmi.session.status`
- `ibmi.session.keepalive`
- `ibmi.session.terminate`

## QSYS Source Lifecycle
- `ibmi.qsys.libraries.create`, `ibmi.qsys.libraries.list`
- `ibmi.qsys.sourcefiles.create`, `ibmi.qsys.sourcefiles.list`
- `ibmi.qsys.members.create`, `ibmi.qsys.members.read`, `ibmi.qsys.members.write`
- `ibmi.qsys.members.rename`, `ibmi.qsys.members.delete`
- `ibmi.qsys.objects.list`
- `ibmi.resolve.path`

## IFS + Deploy
- `ibmi.ifs.mkdir`, `ibmi.ifs.list`, `ibmi.ifs.read`, `ibmi.ifs.write`, `ibmi.ifs.delete`
- `ibmi.ifs.upload`, `ibmi.ifs.download`
- `ibmi.search.ifs`, `ibmi.find.ifs`
- `ibmi.deploy.compare`, `ibmi.deploy.sync`, `ibmi.deploy.uploadDirectory`, `ibmi.deploy.uploadFiles`, `ibmi.deploy.setCcsid`

## SQL + CL + Diagnostics
- `ibmi.sql.query`, `ibmi.sql.execute`
- `ibmi.cl.run`
- `ibmi.diagnostics.parseEvfevent`
- `ibmi.joblog.get`

## Operations Control
- Spool: `ibmi.spool.list`, `ibmi.spool.read`, `ibmi.spool.hold`, `ibmi.spool.release`, `ibmi.spool.move`, `ibmi.spool.delete`
- Jobs: `ibmi.jobs.list`, `ibmi.jobs.hold`, `ibmi.jobs.release`, `ibmi.jobs.end`
- Subsystems: `ibmi.subsystems.list`, `ibmi.subsystems.status`, `ibmi.subsystems.start`, `ibmi.subsystems.end`
- Message queues: `ibmi.msgq.read`, `ibmi.msgq.send`, `ibmi.msgq.reply`
- Locks/authority: `ibmi.locks.list`, `ibmi.authority.object.get`
- Data queues/areas: `ibmi.dataqueue.receive`, `ibmi.dataqueue.send`, `ibmi.dataarea.read`, `ibmi.dataarea.write`

## Audit + Journaling + Compliance
- Audit: `ibmi.audit.list`, `ibmi.audit.export`, `ibmi.audit.verify`, `ibmi.audit.purge`
- Journal lifecycle: `ibmi.journal.create`, `ibmi.journal.startPf`, `ibmi.journal.endPf`, `ibmi.journal.startIfs`, `ibmi.journal.endIfs`
- Journal receivers: `ibmi.journal.receiver.create`, `ibmi.journal.receiver.change`, `ibmi.journal.receivers.retention`
- Journal/QAUD queries: `ibmi.journal.entries.query`, `ibmi.qaudjrn.events.query`, `ibmi.journal.objects.list`
- Compliance: `ibmi.compliance.report.generate`

## TN5250
- `ibmi.tn5250.connect`, `ibmi.tn5250.readScreen`, `ibmi.tn5250.snapshot`
- `ibmi.tn5250.setField`, `ibmi.tn5250.sendKeys`, `ibmi.tn5250.waitFor`, `ibmi.tn5250.disconnect`
