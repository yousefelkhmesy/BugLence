package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.NavigationPage;

public class NavigationTest extends BaseTest {

    @Test
    public void verifyMainNavigation() {

        NavigationPage navigation = new NavigationPage(driver);

        navigation.openRequirementAnalyzer();

        Assert.assertTrue(
                driver.getPageSource().contains("Requirement Analyzer"),
                "Requirement Analyzer page did not open"
        );

        navigation.openBugAnalyzer();

        Assert.assertTrue(
                driver.getPageSource().contains("Bug"),
                "Bug Analyzer page did not open"
        );

        navigation.openTestCases();

        Assert.assertTrue(
                driver.getPageSource().contains("Test Case Generator"),
                "Test Cases page did not open"
        );

        navigation.openTestData();

        Assert.assertTrue(
                driver.getPageSource().contains("Test Data Generator"),
                "Test Data page did not open"
        );

        navigation.openAbout();

        Assert.assertTrue(
                driver.getPageSource().contains("About BugLens"),
                "About page did not open"
        );
    }
}