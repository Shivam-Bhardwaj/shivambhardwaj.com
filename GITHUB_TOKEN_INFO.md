# GitHub Token Storage Locations

## Token Location

Your GitHub Personal Access Token is stored in:

1. **Primary Location:** `/root/repos/shivambhardwaj.com/.env.local`
   - Contains: `GITHUB_TOKEN=<token>`
   - Permissions: 600 (read/write for owner only)

2. **Git Credentials:** `/root/.git-credentials`
   - Contains: `https://<token>@github.com`
   - Permissions: 600 (read/write for owner only)
   - Used by Git for authentication

## To Rotate the Token

1. **Generate new token** on GitHub:
   - Go to: https://github.com/settings/tokens
   - Generate new token with appropriate permissions

2. **Update the files:**
   ```bash
   # Update .env.local
   cd /root/repos/shivambhardwaj.com
   nano .env.local
   # Replace the token value
   
   # Update git credentials
   nano /root/.git-credentials
   # Replace the token in the URL
   ```

3. **Or use these commands:**
   ```bash
   # Update .env.local
   sed -i 's/GITHUB_TOKEN=.*/GITHUB_TOKEN=NEW_TOKEN_HERE/' /root/repos/shivambhardwaj.com/.env.local
   
   # Update git credentials
   echo "https://NEW_TOKEN_HERE@github.com" > /root/.git-credentials
   chmod 600 /root/.git-credentials
   ```

4. **Revoke old token** on GitHub:
   - Go to: https://github.com/settings/tokens
   - Find and revoke the old token

## Security Notes

- Both files have 600 permissions (owner read/write only)
- Token is NOT stored in git repository (`.env.local` is in `.gitignore`)
- Consider using GitHub CLI (`gh auth login`) for better security
- Rotate tokens regularly (every 90 days recommended)

## Current Token Info

- Token: Stored securely in `/root/repos/shivambhardwaj.com/.env.local` and `/root/.git-credentials`
- Status: Active and configured
