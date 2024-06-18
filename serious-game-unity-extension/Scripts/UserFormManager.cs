using System.Text.RegularExpressions;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class UserFormManager : MonoBehaviour
{
    private static readonly string USER_FORM_OBJECT_NAME = "DataCollectionUserForm";
    private static readonly string[] DROPDOWN_OPTIONS = new string[] { "", "m", "f" };
    private static readonly string emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
    public GameObject userFormPrefab;
    private GameObject userFormInstance;
    private TMP_InputField emailFied;
    private TMP_InputField ageField;
    private TMP_Dropdown genderField;
    private Button rejectButton;
    private Button submitButton;
    private GameObject invalidEmailMask;
    private GameObject invalidAgeMask;
    private GameObject invalidGenderMask;

    private string email = "";
    private string age = "";
    private string gender = "";

    void Start()
    {
        userFormPrefab = Resources.Load<GameObject>(USER_FORM_OBJECT_NAME);
        CreateUserForm();
    }

    void OnDestroy()
    {
        if (userFormInstance != null) Destroy(userFormInstance);
    }


    public void CreateUserForm()
    {
        if (userFormPrefab == null) return;


        userFormInstance = Instantiate(userFormPrefab);
        userFormInstance.name = USER_FORM_OBJECT_NAME;
        Button[] controllButtons = userFormInstance.GetComponentsInChildren<Button>();
        foreach (Button btn in controllButtons)
        {
            if (btn.gameObject.name == "Submit") submitButton = btn;
            else if (btn.gameObject.name == "Reject") rejectButton = btn;
        }

        submitButton.onClick.AddListener(OnSubmit);
        rejectButton.onClick.AddListener(OnReject);

        TMP_InputField[] textFields = userFormInstance.GetComponentsInChildren<TMP_InputField>();
        foreach (TMP_InputField field in textFields)
        {
            if (field.gameObject.name == "Email") emailFied = field;
            else if (field.gameObject.name == "Age") ageField = field;
        }

        genderField = userFormInstance.GetComponentInChildren<TMP_Dropdown>();

        emailFied.onValueChanged.AddListener((value) => OnChange("email", value));
        ageField.onValueChanged.AddListener((value) => OnChange("age", value));
        genderField.onValueChanged.AddListener((value) => OnChange("gender", "", true, value));

        invalidEmailMask = userFormInstance.transform.GetChild(0).transform.GetChild(1).transform.GetChild(3).gameObject;
        invalidAgeMask = userFormInstance.transform.GetChild(0).transform.GetChild(1).transform.GetChild(4).gameObject;
        invalidGenderMask = userFormInstance.transform.GetChild(0).transform.GetChild(1).transform.GetChild(5).gameObject;

        invalidEmailMask.GetComponent<Button>().onClick.AddListener(() => invalidEmailMask.SetActive(false));
        invalidAgeMask.GetComponent<Button>().onClick.AddListener(() => invalidAgeMask.SetActive(false));
        invalidGenderMask.GetComponent<Button>().onClick.AddListener(() => invalidGenderMask.SetActive(false));
    }

    private void OnChange(string field, string value, bool dropdown = false, int option = 0)
    {
        if (dropdown && field == "gender") gender = DROPDOWN_OPTIONS[option];
        else if (field == "email") email = value;
        else if (field == "age") age = value;
    }

    private bool Validate()
    {
        bool valid = true;
        if (email.Length == 0 || !Regex.IsMatch(email, emailPattern))
        {
            invalidEmailMask.SetActive(true);
            valid = false;
        }
        if (age.Length == 0 || !int.TryParse(age, out _))
        {
            invalidAgeMask.SetActive(true);
            valid = false;
        }

        if (gender.Length == 0)
        {
            invalidGenderMask.SetActive(true);
            valid = false;
        }

        if (valid)
        {
            invalidEmailMask.SetActive(false);
            invalidAgeMask.SetActive(false);
            invalidGenderMask.SetActive(false);
        }

        return valid;
    }

    private void OnSubmit()
    {
        if (!Validate()) return;

        DataCollection.SaveUserData(email, int.Parse(age), gender);
        OnDestroy();
    }

    private void OnReject()
    {
        DataCollection.PreventDataCollection();
        OnDestroy();
    }

}