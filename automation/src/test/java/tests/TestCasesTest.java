package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import pages.NavigationPage;
import pages.TestCasesPage;

public class TestCasesTest extends BaseTest {

    private TestCasesPage testCasesPage;

    private final String validContext =
            "Registered users should be able to reset their password using a valid email address.";

    @BeforeMethod
    public void openTestCases() {

        NavigationPage navigation =
                new NavigationPage(driver);

        navigation.openTestCases();

        testCasesPage =
                new TestCasesPage(driver);
    }

    // TC-TC-001
    @Test(priority = 1)
    public void generateShouldBeDisabledForEmptyContext() {

        Assert.assertFalse(
                testCasesPage.isGenerateEnabled(),
                "Generate should be disabled for empty context."
        );
    }

    // TC-TC-002
    @Test(priority = 2)
    public void contextShouldAcceptRequirement() {

        testCasesPage.enterContext(validContext);

        Assert.assertEquals(
                testCasesPage.getContext(),
                validContext
        );
    }

    // TC-TC-003
    @Test(priority = 3)
    public void generateShouldBeDisabledForShortContext() {

        testCasesPage.enterContext("short");

        Assert.assertFalse(
                testCasesPage.isGenerateEnabled(),
                "Generate should be disabled below 10 characters."
        );
    }

    // TC-TC-004
    @Test(priority = 4)
    public void generateShouldBeDisabledWithoutTestTypes() {

        testCasesPage.enterContext(validContext);

        testCasesPage.unselectAllTypes();

        Assert.assertFalse(
                testCasesPage.isGenerateEnabled(),
                "Generate should be disabled when no type is selected."
        );
    }

    // TC-TC-005
    @Test(priority = 5)
    public void generateShouldWorkWithOneSelectedType() {

        testCasesPage.enterContext(validContext);

        testCasesPage.unselectAllTypes();

        testCasesPage.selectPositive(true);

        Assert.assertTrue(
                testCasesPage.isGenerateEnabled(),
                "Generate should work with one selected type."
        );
    }

    // TC-TC-006
    @Test(priority = 6)
    public void generateTestCasesSuccessfully() {

        testCasesPage.enterContext(validContext);

        testCasesPage.generate();

        Assert.assertTrue(
                testCasesPage.waitForWorkspace(),
                "Test Case Workspace was not displayed."
        );

        Assert.assertTrue(
                testCasesPage.getTestCaseCount() > 0,
                "No generated test cases were displayed."
        );
    }

    // TC-TC-007
    @Test(priority = 7)
    public void addManualTestCaseSuccessfully() {

        testCasesPage.enterContext(validContext);

        testCasesPage.generate();

        Assert.assertTrue(
                testCasesPage.waitForWorkspace()
        );

        int before =
                testCasesPage.getTestCaseCount();

        testCasesPage.addTestCase();

        int after =
                testCasesPage.getTestCaseCount();

        Assert.assertEquals(
                after,
                before + 1,
                "Manual test case was not added."
        );
    }

    // TC-TC-008
    @Test(priority = 8)
    public void deleteTestCaseSuccessfully() {

        testCasesPage.enterContext(validContext);

        testCasesPage.generate();

        Assert.assertTrue(
                testCasesPage.waitForWorkspace()
        );

        int before =
                testCasesPage.getTestCaseCount();

        testCasesPage.deleteFirstTestCase();

        int after =
                testCasesPage.getTestCaseCount();

        Assert.assertEquals(
                after,
                before - 1,
                "Test case was not deleted."
        );
    }

    // TC-TC-009
    @Test(priority = 9)
    public void workspaceActionsShouldBeAvailable() {

        testCasesPage.enterContext(validContext);

        testCasesPage.generate();

        Assert.assertTrue(
                testCasesPage.waitForWorkspace()
        );

        Assert.assertTrue(
                testCasesPage.isExportExcelAvailable(),
                "Export Excel is missing."
        );

        Assert.assertTrue(
                testCasesPage.isExistingSuiteAvailable(),
                "Add to Existing Test Suite is missing."
        );
    }
}