export function LoginWidget() {
  return (
    <div className="card rounded bg-white bg-opacity-5 text-neutral-content drop-shadow-lg backdrop-blur-sm lg:card-side">
      <div className="card-body max-w-md">
        <h2 className="card-title">Login</h2>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            placeholder="email"
            className="input-bordered input"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            placeholder="password"
            className="input-bordered input"
          />
        </div>
        <div className="form-control mt-4">
          <input
            type="checkbox"
            id="remember-me"
            checked
            className="checkbox-accent checkbox"
          />
          <label htmlFor="remember-me" className="label">
            <span className="label-text">Remember me</span>
          </label>
        </div>
        <div className="form-control mt-6">
          <button className="btn-primary btn">Submit</button>
        </div>
      </div>
    </div>
  );
}
