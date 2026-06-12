  - GET /api/accounts/profile route exists, but controller
    still reads missing req.params.accountId.

  - GET /api/tests/user/:userId route exists, but
    testController.getTestsByUserId is missing.

  - Test attempt controller uses testAttemptModel/questionModel
    but imports are not shown in tests.controllers.js.

  - startTest uses req.user.id, while JWT middleware sets
    accountId.