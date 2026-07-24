package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;
import pages.NavigationPage;
import pages.RequirementAnalyzerPage;

public class RequirementAnalyzerTest extends BaseTest {

    private RequirementAnalyzerPage requirementPage;

    private final String validRequirement =
            "As a registered user, I want to reset my password using my email address so that I can regain access to my account.";

    @BeforeMethod
    public void openRequirementAnalyzer() {

        NavigationPage navigation =
                new NavigationPage(driver);

        navigation.openRequirementAnalyzer();

        requirementPage =
                new RequirementAnalyzerPage(driver);
    }

    // TC-RA-001
    @Test(priority = 1)
    public void analyzeButtonShouldBeDisabledForEmptyRequirement() {

        Assert.assertFalse(
                requirementPage.isAnalyzeButtonEnabled(),
                "Analyze button should be disabled for empty input."
        );
    }

    // TC-RA-002
    @Test(priority = 2)
    public void requirementInputShouldAcceptValidText() {

        requirementPage.enterRequirement(validRequirement);

        Assert.assertEquals(
                requirementPage.getRequirementValue(),
                validRequirement,
                "Requirement input does not contain the entered text."
        );
    }

    // TC-RA-003
    @Test(priority = 3)
    public void analyzeButtonShouldBeDisabledForShortRequirement() {

        requirementPage.enterRequirement("short");

        Assert.assertFalse(
                requirementPage.isAnalyzeButtonEnabled(),
                "Analyze button should remain disabled for input below minimum length."
        );
    }

    // TC-RA-004
    @Test(priority = 4)
    public void userShouldBeAbleToSelectAllAnalysisOptions() {

        requirementPage.selectAllOptions();

        Assert.assertTrue(
                requirementPage.isAmbiguitiesSelected(),
                "Ambiguities option was not selected."
        );

        Assert.assertTrue(
                requirementPage.isMissingInformationSelected(),
                "Missing Information option was not selected."
        );

        Assert.assertTrue(
                requirementPage.isRisksSelected(),
                "Risks option was not selected."
        );

        Assert.assertTrue(
                requirementPage.isTestScenariosSelected(),
                "Test Scenarios option was not selected."
        );

        Assert.assertTrue(
                requirementPage.isEdgeCasesSelected(),
                "Edge Cases option was not selected."
        );
    }

    // TC-RA-005
    @Test(priority = 5)
    public void analyzeButtonShouldBeDisabledWithoutAnalysisOptions() {

        requirementPage.enterRequirement(validRequirement);

        requirementPage.unselectAllOptions();

        Assert.assertFalse(
                requirementPage.isAnalyzeButtonEnabled(),
                "Analyze button should be disabled when no analysis option is selected."
        );
    }

    // TC-RA-006
    @Test(priority = 6)
    public void analyzeButtonShouldBeEnabledForValidInputAndSelectedOption() {

        requirementPage.enterRequirement(validRequirement);

        requirementPage.unselectAllOptions();

        requirementPage.selectRisks();

        Assert.assertTrue(
                requirementPage.isAnalyzeButtonEnabled(),
                "Analyze button should be enabled for valid input and one selected option."
        );
    }

    // TC-RA-007
    @Test(priority = 7)
    public void analyzeValidRequirementSuccessfully() {

        requirementPage.enterRequirement(validRequirement);

        requirementPage.unselectAllOptions();
        requirementPage.selectAllOptions();

        Assert.assertTrue(
                requirementPage.isAnalyzeButtonEnabled(),
                "Analyze button should be enabled."
        );

        requirementPage.clickAnalyze();

        Assert.assertTrue(
                requirementPage.waitForResults(),
                "AI Analysis Results were not displayed."
        );

        Assert.assertTrue(
                requirementPage.areResultsDisplayed(),
                "Analysis Results section is missing."
        );
    }

    // TC-RA-008
    @Test(priority = 8)
    public void copyActionShouldBeAvailableAfterAnalysis() {

        requirementPage.enterRequirement(validRequirement);

        requirementPage.unselectAllOptions();
        requirementPage.selectRisks();

        requirementPage.clickAnalyze();

        Assert.assertTrue(
                requirementPage.waitForResults(),
                "Analysis did not complete successfully."
        );

        Assert.assertTrue(
                requirementPage.isCopyButtonDisplayed(),
                "Copy action should be available after analysis."
        );
    }
}