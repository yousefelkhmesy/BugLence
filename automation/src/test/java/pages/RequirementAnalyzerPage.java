package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class RequirementAnalyzerPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By requirementInput = By.id("requirement-input");

    private final By ambiguities =
            By.xpath("//label[contains(.,'Identify ambiguities')]//input");

    private final By missingInformation =
            By.xpath("//label[contains(.,'Identify missing information')]//input");

    private final By risks =
            By.xpath("//label[contains(.,'Identify risks')]//input");

    private final By testScenarios =
            By.xpath("//label[contains(.,'Suggest test scenarios')]//input");

    private final By edgeCases =
            By.xpath("//label[contains(.,'Suggest edge cases')]//input");

    private final By analyzeButton =
            By.xpath("//button[contains(.,'Analyze Requirement')]");

    private final By analysisResults =
            By.xpath("//h2[contains(.,'Analysis Results')]");

    private final By copyButton =
            By.xpath("//button[contains(.,'Copy')]");

    public RequirementAnalyzerPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    private WebElement getElement(By locator) {
        return wait.until(
                ExpectedConditions.presenceOfElementLocated(locator)
        );
    }

    private void scrollTo(WebElement element) {
        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block:'center'});",
                element
        );
    }

    private void clickElement(By locator) {

        WebElement element = wait.until(
                ExpectedConditions.presenceOfElementLocated(locator)
        );

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block:'center', inline:'center'});",
                element
        );

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].click();",
                element
        );
    }

    public void enterRequirement(String requirement) {

        WebElement input = wait.until(
                ExpectedConditions.visibilityOfElementLocated(requirementInput)
        );

        input.clear();
        input.sendKeys(requirement);
    }

    public String getRequirementValue() {
        return getElement(requirementInput).getAttribute("value");
    }

    public void selectAmbiguities() {
        clickElement(ambiguities);
    }

    public void selectMissingInformation() {
        clickElement(missingInformation);
    }

    public void selectRisks() {
        clickElement(risks);
    }

    public void selectTestScenarios() {
        clickElement(testScenarios);
    }

    public void selectEdgeCases() {
        clickElement(edgeCases);
    }

    public void selectAllOptions() {
        selectAmbiguities();
        selectMissingInformation();
        selectRisks();
        selectTestScenarios();
        selectEdgeCases();
    }

    public void unselectAllOptions() {

        List<By> options = List.of(
                ambiguities,
                missingInformation,
                risks,
                testScenarios,
                edgeCases
        );

        for (By option : options) {

            WebElement checkbox = getElement(option);

            if (checkbox.isSelected()) {
                scrollTo(checkbox);
                checkbox.click();
            }
        }
    }

    public boolean isAmbiguitiesSelected() {
        return getElement(ambiguities).isSelected();
    }

    public boolean isMissingInformationSelected() {
        return getElement(missingInformation).isSelected();
    }

    public boolean isRisksSelected() {
        return getElement(risks).isSelected();
    }

    public boolean isTestScenariosSelected() {
        return getElement(testScenarios).isSelected();
    }

    public boolean isEdgeCasesSelected() {
        return getElement(edgeCases).isSelected();
    }

    public boolean isAnalyzeButtonEnabled() {
        return getElement(analyzeButton).isEnabled();
    }

    public void clickAnalyze() {
        clickElement(analyzeButton);
    }

    public boolean isLoadingDisplayed() {

        try {
            return driver.findElement(analyzeButton)
                    .getText()
                    .toLowerCase()
                    .contains("analy");
        } catch (Exception e) {
            return false;
        }
    }

    public boolean waitForResults() {

        WebDriverWait aiWait =
                new WebDriverWait(driver, Duration.ofSeconds(120));

        try {

            WebElement results = aiWait.until(
                    ExpectedConditions.visibilityOfElementLocated(
                            analysisResults
                    )
            );

            return results.isDisplayed();

        } catch (Exception e) {
            return false;
        }
    }

    public boolean areResultsDisplayed() {

        try {
            return driver.findElement(analysisResults).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isCopyButtonDisplayed() {
        try {
            WebDriverWait copyWait =
                    new WebDriverWait(driver, Duration.ofSeconds(30));

            WebElement button = copyWait.until(
                    ExpectedConditions.visibilityOfElementLocated(copyButton)
            );

            return button.isDisplayed() && button.isEnabled();

        } catch (Exception e) {
            return false;
        }
    }
}
