package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import pages.BugAnalyzerPage;
import pages.NavigationPage;

public class BugAnalyzerTest extends BaseTest {

    private BugAnalyzerPage bugPage;

    private final String validBug =
            "On the checkout page, clicking Place Order shows an endless spinner and the order is not created.";

    @BeforeMethod
    public void openBugAnalyzer() {

        NavigationPage navigation =
                new NavigationPage(driver);

        navigation.openBugAnalyzer();

        bugPage =
                new BugAnalyzerPage(driver);
    }

    // TC-BA-001
    @Test(priority = 1)
    public void generateShouldBeDisabledForEmptyDescription() {

        Assert.assertFalse(
                bugPage.isGenerateEnabled(),
                "Generate should be disabled for empty description."
        );
    }

    // TC-BA-002
    @Test(priority = 2)
    public void descriptionShouldAcceptText() {

        bugPage.enterDescription(validBug);

        Assert.assertEquals(
                bugPage.getDescription(),
                validBug
        );
    }

    // TC-BA-003
    @Test(priority = 3)
    public void generateShouldBeDisabledForShortDescription() {

        bugPage.enterDescription("bug");

        Assert.assertFalse(
                bugPage.isGenerateEnabled(),
                "Generate should be disabled below 10 characters."
        );
    }

    // TC-BA-004
    @Test(priority = 4)
    public void generateShouldBeEnabledForValidBug() {

        bugPage.enterDescription(validBug);

        Assert.assertTrue(
                bugPage.isGenerateEnabled(),
                "Generate should be enabled for valid bug data."
        );
    }

    // TC-BA-005
    @Test(priority = 5)
    public void generateBugReportSuccessfully() {

        bugPage.enterDescription(validBug);

        Assert.assertTrue(
                bugPage.isGenerateEnabled()
        );

        bugPage.generateReport();

        Assert.assertTrue(
                bugPage.waitForReport(),
                "Bug report was not generated."
        );

        Assert.assertTrue(
                bugPage.isCopyAvailable(),
                "Copy action should be available."
        );
    }

    // TC-BA-006
    @Test(priority = 6)
    public void aiActionsShouldBeAvailableAfterReportGeneration() {

        bugPage.enterDescription(validBug);

        bugPage.generateReport();

        Assert.assertTrue(
                bugPage.waitForReport(),
                "Bug report generation failed."
        );

        Assert.assertTrue(
                bugPage.isGenerateInsightsAvailable(),
                "AI Insights action is missing."
        );

        Assert.assertTrue(
                bugPage.isGenerateTestCasesAvailable(),
                "Generate Test Cases action is missing."
        );
    }
}