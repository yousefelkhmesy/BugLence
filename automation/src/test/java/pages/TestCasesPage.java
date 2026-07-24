package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class TestCasesPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By context =
            By.id("test-context");

    private final By positive =
            By.xpath("//label[contains(.,'Positive')]//input");

    private final By negative =
            By.xpath("//label[contains(.,'Negative')]//input");

    private final By edge =
            By.xpath("//label[contains(.,'Edge Cases')]//input");

    private final By regression =
            By.xpath("//label[contains(.,'Regression')]//input");

    private final By generateButton =
            By.xpath("//button[contains(.,'Generate Test Cases')]");

    private final By workspace =
            By.xpath("//h2[contains(.,'Test Case Workspace')]");

    private final By addTestCase =
            By.xpath("//button[contains(.,'Add Test Case')]");

    private final By exportExcel =
            By.xpath("//button[contains(.,'Export Excel')]");

    private final By addExistingSuite =
            By.xpath("//button[contains(.,'Add to Existing Test Suite')]");

    private final By testCaseCards =
            By.xpath("//article");

    public TestCasesPage(WebDriver driver) {

        this.driver = driver;

        this.wait =
                new WebDriverWait(
                        driver,
                        Duration.ofSeconds(15)
                );
    }

    private WebElement element(By locator) {

        return wait.until(
                ExpectedConditions.presenceOfElementLocated(
                        locator
                )
        );
    }

    private void scroll(WebElement element) {

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block:'center'});",
                element
        );
    }

    private void click(By locator) {

        WebElement element = wait.until(
                ExpectedConditions.visibilityOfElementLocated(locator)
        );

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block:'center', inline:'center'});",
                element
        );

        wait.until(
                ExpectedConditions.elementToBeClickable(element)
        );

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].click();",
                element
        );
    }

    public void enterContext(String text) {

        WebElement input = element(context);

        input.clear();
        input.sendKeys(text);
    }

    public String getContext() {

        return element(context)
                .getAttribute("value");
    }

    public boolean isGenerateEnabled() {

        return element(generateButton)
                .isEnabled();
    }

    public void generate() {

        click(generateButton);
    }

    private void setCheckbox(By locator, boolean selected) {

        WebElement checkbox = wait.until(
                ExpectedConditions.presenceOfElementLocated(locator)
        );

        if (checkbox.isSelected() != selected) {

            ((JavascriptExecutor) driver).executeScript(
                    "arguments[0].scrollIntoView({block:'center', inline:'center'});",
                    checkbox
            );

            ((JavascriptExecutor) driver).executeScript(
                    "arguments[0].click();",
                    checkbox
            );
        }
    }

    public void selectPositive(boolean selected) {
        setCheckbox(positive, selected);
    }

    public void selectNegative(boolean selected) {
        setCheckbox(negative, selected);
    }

    public void selectEdge(boolean selected) {
        setCheckbox(edge, selected);
    }

    public void selectRegression(boolean selected) {
        setCheckbox(regression, selected);
    }

    public void unselectAllTypes() {

        selectPositive(false);
        selectNegative(false);
        selectEdge(false);
        selectRegression(false);
    }

    public boolean waitForWorkspace() {

        WebDriverWait aiWait =
                new WebDriverWait(
                        driver,
                        Duration.ofSeconds(120)
                );

        try {

            WebElement result =
                    aiWait.until(
                            ExpectedConditions
                                    .visibilityOfElementLocated(
                                            workspace
                                    )
                    );

            return result.isDisplayed();

        } catch (Exception e) {

            return false;
        }
    }

    public int getTestCaseCount() {

        List<WebElement> cards =
                driver.findElements(testCaseCards);

        return cards.size();
    }

    public void addTestCase() {
        click(addTestCase);
    }

    public boolean isExportExcelAvailable() {

        return !driver
                .findElements(exportExcel)
                .isEmpty();
    }

    public boolean isExistingSuiteAvailable() {

        return !driver
                .findElements(addExistingSuite)
                .isEmpty();
    }

    public void deleteFirstTestCase() {

        By deleteButton =
                By.xpath("(//article//button[contains(.,'Delete')])[1]");

        WebElement button = wait.until(
                ExpectedConditions.visibilityOfElementLocated(deleteButton)
        );

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block:'center', inline:'center'});",
                button
        );

        ((JavascriptExecutor) driver).executeScript(
                "arguments[0].click();",
                button
        );
    }
    }
