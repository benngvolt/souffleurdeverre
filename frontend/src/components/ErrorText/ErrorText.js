import './ErrorText.scss'

function ErrorText ({errorText, state}) {

    return (
        <p className={`errorText errorText_${state}`}>
           {errorText}
        </p>
    )
}

export default ErrorText