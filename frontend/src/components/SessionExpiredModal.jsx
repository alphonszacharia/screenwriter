import React from "react";

function SessionExpiredModal({ onLogin }) {
    return (
        <div className="session-expired-overlay">

            <div className="cinema-frame">

                <div className="cinema-corner cinema-corner-tl" />
                <div className="cinema-corner cinema-corner-tr" />
                <div className="cinema-corner cinema-corner-bl" />
                <div className="cinema-corner cinema-corner-br" />

                <div className="film-line film-line-top" />
                <div className="film-line film-line-bottom" />

                <div className="cinema-content">

                    <div className="cinema-mark">
                        <span />
                        <span />
                        <span />
                    </div>

                    <div className="cinema-eyebrow">
                        SCREENWRITER
                    </div>

                    <div className="cinema-divider">
                        <span />
                        <div>SCENE</div>
                        <span />
                    </div>

                    <h1>
                        Your session
                        <br />
                        <em>has ended.</em>
                    </h1>

                    <p>
                        The scene has been paused.
                        <br />
                        Sign in again to continue your story.
                    </p>

                    <button
                        type="button"
                        className="cinema-signin-button"
                        onClick={onLogin}
                    >
                        <span>RETURN TO SCREENWRITER</span>
                        <strong>→</strong>
                    </button>

                    <div className="cinema-caption">
                        YOUR STORIES. YOUR WORLD. YOUR VOICE.
                    </div>

                </div>

            </div>

        </div>
    );
}

export default SessionExpiredModal;